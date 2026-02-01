"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

// =============================================================================
// TYPES
// =============================================================================

export interface SlideData {
    id: string;
    code: string;
}

/** State for inline text editing overlay */
export interface EditingState {
    originalText: string;
    currentText: string;
    rect: DOMRect;
    fontSize: string;
    fontWeight: string;
    fontFamily: string;
    fontStyle: string;
    color: string;
    textAlign: string;
    textTransform: string;
    lineHeight: string;
    letterSpacing: string;
    padding: string;
    /** Whether the original element contained BR tags (need to restore on save) */
    hasBrTags?: boolean;
    /** Original innerHTML if BR tags present (for precise replacement) */
    originalInnerHTML?: string;
    /** Context for text node editing - enables precise replacement */
    textNodeContext?: {
        beforeText: string;
        afterText: string;
    };
}

// =============================================================================
// FONT LOADER UTILITY
// =============================================================================

function extractFonts(code: string): string[] {
    const fontRegex = /font-\['([^']+)'\]/g;
    const fonts: Set<string> = new Set();
    let match;
    while ((match = fontRegex.exec(code)) !== null) {
        fonts.add(match[1].replace(/_/g, ' '));
    }
    return Array.from(fonts);
}

function useFontLoader(code: string) {
    const fonts = useMemo(() => extractFonts(code), [code]);

    useEffect(() => {
        if (fonts.length === 0) return;

        const fontFamilies = fonts.map(f => f.replace(/ /g, '+')).join('&family=');
        const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@300;400;500;600;700&display=swap`;

        const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
        if (!existingLink) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontUrl;
            document.head.appendChild(link);
        }
    }, [fonts]);
}

function processCodeForLive(code: string): string {
    const codeWithoutImportsExports = code
        .split('\n')
        .filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('import ') && !trimmed.startsWith('export ');
        })
        .join('\n');

    return `${codeWithoutImportsExports}\n\nrender(<Slide />);`;
}

// =============================================================================
// SLIDE FROM CODE - Read-only slide renderer
// =============================================================================

interface SlideFromCodeProps {
    code: string;
    className?: string;
}

export function SlideFromCode({ code, className = "" }: SlideFromCodeProps) {
    useFontLoader(code);
    const processedCode = useMemo(() => processCodeForLive(code), [code]);

    return (
        <div className={`w-full h-full ${className}`}>
            <LiveProvider code={processedCode} noInline={true} scope={{ React }}>
                <LivePreview className="w-full h-full" />
                <LiveError className="text-red-500 text-xs p-2 bg-red-50 absolute bottom-0 left-0 right-0" />
            </LiveProvider>
        </div>
    );
}

// =============================================================================
// EDITABLE SLIDE FROM CODE - Interactive text editing
// =============================================================================

interface EditableSlideFromCodeProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    className?: string;
    scale?: number;
}

// =============================================================================
// TEXT EDITING HELPERS
// =============================================================================

/**
 * Check if an element is a text element that should be editable.
 * Allows elements with <br> tags and inline formatting children.
 */
function isEditableTextElement(el: HTMLElement): boolean {
    const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'LI', 'DIV'];
    // Inline formatting tags that are acceptable as children
    const inlineFormattingTags = ['SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'A', 'BR'];

    if (!textTags.includes(el.tagName)) return false;

    const text = el.textContent?.trim() || '';
    if (text.length === 0) return false;

    // Check for child elements
    const childElements = Array.from(el.children);

    // For DIV elements, must be a true leaf (no child elements) or only BR elements
    if (el.tagName === 'DIV') {
        const nonBrChildren = childElements.filter(child => child.tagName !== 'BR');
        if (nonBrChildren.length > 0) return false;
        if (text.length < 2) return false;
    } else {
        // For H1-H6, P, SPAN, LI:
        // Allow if all children are inline formatting elements (SPAN, BR, STRONG, etc.)
        // These are styling elements that don't change semantic structure
        for (const child of childElements) {
            if (inlineFormattingTags.includes(child.tagName)) {
                // Always allow inline formatting children
                // (handles cases like: "Text <span>styled text</span> more text")
                continue;
            }

            const childText = child.textContent?.trim() || '';
            if (childText.length > 0) {
                return false; // Non-inline child has text - editing would mix/lose structure
            }
        }
    }

    // Don't edit pure numbers (likely slide counters/page numbers)
    if (/^\d+$/.test(text)) return false;

    return true;
}

/**
 * Find the closest editable text element from clicked target.
 * Prefers parent text elements over inline children (SPAN inside P should return P).
 */
function findEditableElement(target: HTMLElement, container: HTMLElement): HTMLElement | null {
    // Inline elements that should bubble up to their parent when inside a text element
    const inlineElements = ['SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'A'];
    // Block-level text elements that contain the full text
    const blockTextElements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'DIV'];

    let current: HTMLElement | null = target;
    let firstMatch: HTMLElement | null = null;

    while (current && current !== container && current !== document.body) {
        if (isEditableTextElement(current)) {
            // If this is an inline element and we haven't found a match yet,
            // continue looking for a parent block element
            if (inlineElements.includes(current.tagName)) {
                if (!firstMatch) {
                    firstMatch = current;
                }
                // Keep looking for a parent block element
            } else if (blockTextElements.includes(current.tagName)) {
                // Found a block-level text element - prefer this over inline children
                return current;
            } else if (!firstMatch) {
                firstMatch = current;
            }
        }
        current = current.parentElement;
    }

    // Return the first match if we didn't find a better parent
    return firstMatch;
}

/**
 * Get text content preceding a text node within its parent
 * Used for context-aware replacement
 */
function getPrecedingText(textNode: Text, maxChars: number = 30): string {
    const parent = textNode.parentNode;
    if (!parent) return '';

    let text = '';
    let sibling: ChildNode | null = textNode.previousSibling;

    while (sibling && text.length < maxChars) {
        if (sibling.nodeType === Node.TEXT_NODE) {
            text = (sibling.textContent || '') + text;
        } else if (sibling.nodeType === Node.ELEMENT_NODE) {
            // Include tag markers to ensure uniqueness
            const el = sibling as Element;
            text = `<${el.tagName.toLowerCase()}>` + text;
        }
        sibling = sibling.previousSibling;
    }

    return text.slice(-maxChars);
}

/**
 * Get text content following a text node within its parent
 * Used for context-aware replacement
 */
function getFollowingText(textNode: Text, maxChars: number = 30): string {
    const parent = textNode.parentNode;
    if (!parent) return '';

    let text = '';
    let sibling: ChildNode | null = textNode.nextSibling;

    while (sibling && text.length < maxChars) {
        if (sibling.nodeType === Node.TEXT_NODE) {
            text = text + (sibling.textContent || '');
        } else if (sibling.nodeType === Node.ELEMENT_NODE) {
            // Include tag markers to ensure uniqueness
            const el = sibling as Element;
            text = text + `<${el.tagName.toLowerCase()}>`;
        }
        sibling = sibling.nextSibling;
    }

    return text.slice(0, maxChars);
}

export function EditableSlideFromCode({ code, onCodeChange, className = "", scale = 1 }: EditableSlideFromCodeProps) {
    useFontLoader(code);
    const processedCode = useMemo(() => processCodeForLive(code), [code]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Editing state for inline text overlay
    const [editingState, setEditingState] = useState<EditingState | null>(null);

    // Store reference to text node being edited (for hiding/restoring)
    const editingTextNodeRef = useRef<{ node: Text; originalData: string } | null>(null);

    // Store reference to the element being edited (for hiding)
    const editingElementRef = useRef<HTMLElement | null>(null);

    // Reference to the editable overlay
    const editableRef = useRef<HTMLDivElement>(null);

    // Clear editing state when slide changes (code prop changes)
    useEffect(() => {
        // Restore opacity of any hidden elements
        if (editingElementRef.current) {
            editingElementRef.current.style.opacity = '';
            editingElementRef.current = null;
        }
        editingTextNodeRef.current = null;
        setEditingState(null);
    }, [code]);

    // Handle starting edit mode
    const startEditing = useCallback((element: HTMLElement) => {
        const text = element.textContent || '';
        if (!text.trim()) return;

        const rect = element.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        // Get computed styles from the original element
        const computedStyle = window.getComputedStyle(element);

        // Calculate position relative to container, accounting for scale
        // We un-scale the viewport coordinates to get back to logical (1920x1080) coordinates
        const relativeRect = new DOMRect(
            (rect.left - containerRect.left) / scale,
            (rect.top - containerRect.top) / scale,
            rect.width / scale,
            rect.height / scale
        );

        // Check if element contains BR tags or inline formatting children
        const hasBrTags = element.querySelector('br') !== null;
        const hasInlineChildren = element.querySelector('span, strong, em, b, i, u, a') !== null;
        const hasComplexContent = hasBrTags || hasInlineChildren;

        let editableText = text;
        let originalInnerHTML: string | undefined;

        if (hasComplexContent) {
            // Store original innerHTML for precise replacement when saving
            originalInnerHTML = element.innerHTML;
            // Convert innerHTML: replace <br> with newlines, then strip other tags
            editableText = element.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '') // Remove any remaining tags
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
        }

        // Hide the original element immediately (use opacity to hide borders/decorations too)
        element.style.opacity = '0';
        editingElementRef.current = element;

        setEditingState({
            originalText: editableText,
            currentText: editableText,
            rect: relativeRect,
            fontSize: computedStyle.fontSize,
            fontWeight: computedStyle.fontWeight,
            fontFamily: computedStyle.fontFamily,
            fontStyle: computedStyle.fontStyle,
            color: computedStyle.color,
            textAlign: computedStyle.textAlign,
            textTransform: computedStyle.textTransform,
            lineHeight: computedStyle.lineHeight,
            letterSpacing: computedStyle.letterSpacing,
            padding: computedStyle.padding,
            hasBrTags: hasComplexContent, // Reusing this flag for all complex content
            originalInnerHTML,
        });
    }, [scale]);

    // Handle starting edit mode for a bare text node (not wrapped in editable element)
    const startEditingTextNode = useCallback((textNode: Text) => {
        const text = textNode.textContent || '';
        if (!text.trim()) return;

        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        // Get bounding rect of text node using Range API
        const textRange = document.createRange();
        textRange.selectNodeContents(textNode);
        const rect = textRange.getBoundingClientRect();

        // Get computed styles from parent element
        const parentElement = textNode.parentElement;
        if (!parentElement) return;
        const computedStyle = window.getComputedStyle(parentElement);

        // Calculate position relative to container, accounting for scale
        const relativeRect = new DOMRect(
            (rect.left - containerRect.left) / scale,
            (rect.top - containerRect.top) / scale,
            rect.width / scale,
            rect.height / scale
        );

        // Capture context for precise replacement (siblings text)
        const beforeText = getPrecedingText(textNode);
        const afterText = getFollowingText(textNode);

        // Store text node reference for hiding
        editingTextNodeRef.current = { node: textNode, originalData: text };

        // Hide the text node by emptying it
        textNode.data = '';

        setEditingState({
            originalText: text,
            currentText: text,
            rect: relativeRect,
            fontSize: computedStyle.fontSize,
            fontWeight: computedStyle.fontWeight,
            fontFamily: computedStyle.fontFamily,
            fontStyle: computedStyle.fontStyle,
            color: computedStyle.color,
            textAlign: computedStyle.textAlign,
            textTransform: computedStyle.textTransform,
            lineHeight: computedStyle.lineHeight,
            letterSpacing: computedStyle.letterSpacing,
            padding: computedStyle.padding,
            textNodeContext: { beforeText, afterText },
        });
    }, [scale]);

    // Focus overlay and hide original text
    useEffect(() => {
        if (editingState && editableRef.current) {
            editableRef.current.focus();
            // Select all text
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editableRef.current);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }

        const hideOriginalText = () => {
            if (!editingState || !containerRef.current) return;

            // Check if our stored element reference is still in the DOM
            const isElementInDOM = editingElementRef.current && document.contains(editingElementRef.current);

            if (isElementInDOM) {
                // Element is still in DOM - hide it and its children
                if (editingElementRef.current!.style.opacity !== '0') {
                    editingElementRef.current!.style.opacity = '0';
                }
                const children = editingElementRef.current!.querySelectorAll('*');
                children.forEach((child) => {
                    const htmlChild = child as HTMLElement;
                    if (htmlChild.style && htmlChild.style.opacity !== '0') {
                        htmlChild.style.opacity = '0';
                    }
                });
            } else {
                // Element was replaced by React-Live re-render - find new element by text content
                // Search for elements with matching textContent
                const allElements = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, div');

                // Normalize target text: replace newlines with spaces, collapse whitespace
                const normalizeText = (text: string) => text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                const targetText = normalizeText(editingState.originalText);

                for (const el of allElements) {
                    const htmlEl = el as HTMLElement;
                    // Skip our editing overlay
                    if (htmlEl === editableRef.current || editableRef.current?.contains(htmlEl)) continue;

                    // Match by textContent (normalized)
                    const elText = normalizeText(htmlEl.textContent || '');

                    if (elText === targetText) {
                        // Found the element - update our ref and hide it
                        editingElementRef.current = htmlEl;
                        htmlEl.style.opacity = '0';

                        // Also hide children
                        const children = htmlEl.querySelectorAll('*');
                        children.forEach((child) => {
                            const htmlChild = child as HTMLElement;
                            if (htmlChild.style) {
                                htmlChild.style.opacity = '0';
                            }
                        });
                        break;
                    }
                }
            }
        };

        // Run immediately to avoid initial ghosting
        hideOriginalText();

        // Run periodically to handle react-live re-renders
        const hideInterval = setInterval(hideOriginalText, 50);

        // Capture containerRef.current for cleanup (per react-hooks/exhaustive-deps)
        const container = containerRef.current;

        return () => {
            clearInterval(hideInterval);
            // Restore opacity of the editing element when editing ends
            if (editingElementRef.current) {
                editingElementRef.current.style.opacity = '';
                // Also restore children
                const children = editingElementRef.current.querySelectorAll('*');
                children.forEach((child) => {
                    const htmlChild = child as HTMLElement;
                    if (htmlChild.style) {
                        htmlChild.style.opacity = '';
                    }
                });
                editingElementRef.current = null;
            }
            // Also restore any other hidden elements (from text node editing)
            if (container) {
                const allElements = container.getElementsByTagName('*');
                for (let i = 0; i < allElements.length; i++) {
                    const el = allElements[i] as HTMLElement;
                    if (el.style.opacity === '0') {
                        el.style.opacity = '';
                    }
                }
            }
        };
    }, [editingState]);

    // Handle stopping edit mode
    const stopEditing = useCallback((save: boolean = true) => {
        if (!editingState) return;

        // 1. Extract and Normalize New Text
        let newText = editingState.currentText;
        if (editableRef.current) {
            // contentEditable robust text extraction
            // Replaces block elements and BRs with newlines

            // Using innerHTML replacement is often safer for simple contentEditable handling
            newText = editableRef.current.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<div>/gi, '\n')
                .replace(/<\/div>/gi, '')
                .replace(/<p>/gi, '\n')
                .replace(/<\/p>/gi, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/<[^>]+>/g, ''); // Strip remaining tags to get plain text
        }

        // Trim and normalize newlines
        // Collapse multiple newlines to single if that's desired, but usually we keep them
        // for multi-line preservation. 
        // We trim start/end to avoid accidental whitespace saves.
        newText = newText.trim();

        // 2. Compare with Original
        // Normalize original text similarly for comparison
        const originalNormalized = editingState.originalText.trim();

        if (!save || newText === originalNormalized) {
            // Restore text node if needed
            if (editingTextNodeRef.current) {
                editingTextNodeRef.current.node.data = editingTextNodeRef.current.originalData;
                editingTextNodeRef.current = null;
            }
            setEditingState(null);
            return;
        }

        // 3. Perform Replacement in Code
        let updatedCode = code;
        let changeMade = false;

        // Helper: Escape string for Regex
        const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Strategy A: Precise Text Node Context (Best for partial edits)
        if (editingState.textNodeContext) {
            const { beforeText, afterText } = editingState.textNodeContext;
            const contextPattern = new RegExp(
                escapeRegExp(beforeText) +
                escapeRegExp(editingState.originalText) +
                escapeRegExp(afterText)
            );

            if (contextPattern.test(code)) {
                updatedCode = code.replace(contextPattern, beforeText + newText + afterText);
                changeMade = true;
            } else {
                // Fallback: Try matching just the original text if unique
                const globalMatch = code.split(editingState.originalText).length - 1;
                if (globalMatch === 1) {
                    updatedCode = code.replace(editingState.originalText, newText);
                    changeMade = true;
                }
            }
        }
        // Strategy B: Element Content Replacement (Handles BRs, spans, structure)
        else {
            // Parse text into logical parts (lines)
            const originalParts = editingState.originalText.split(/\n+/).map(s => s.trim()).filter(s => s.length);
            const newParts = newText.split(/\n+/).map(s => s.trim()).filter(s => s.length);

            // Case B1: Structure Preserved (1:1 Line Match)
            // Best for fixing typos or changing words while keeping styling
            if (originalParts.length > 0 && originalParts.length === newParts.length) {
                const tempCode = code;
                let allPartsFound = true;

                // Verify all parts exist before replacing
                for (const part of originalParts) {
                    if (!tempCode.includes(part)) {
                        allPartsFound = false;
                        break;
                    }
                }

                if (allPartsFound) {
                    // Replace each part
                    // We iterate backwards to try and avoid messing up indices if we were using them,
                    // but with string replace it matters less unless parts are identical.
                    // To be safe with duplicates: 
                    // We should really find the *cluster* of these parts in the code.

                    // Construct a loose regex matching the sequence of parts
                    const sequencePatternStr = originalParts
                        .map(p => escapeRegExp(p))
                        .join('[\\s\\S]*?'); // [\s\S]*? matches any char including newlines, non-greedy

                    const sequenceRegex = new RegExp(sequencePatternStr);
                    const match = tempCode.match(sequenceRegex);

                    if (match) {
                        // We found the block containing all parts!
                        // Now replace parts *inside this block*
                        let blockContent = match[0];

                        // Replace parts within the block
                        for (let i = 0; i < originalParts.length; i++) {
                            // Only replace if changed
                            if (originalParts[i] !== newParts[i]) {
                                // Replace only the FIRST occurrence in this block chunk
                                // This assumes originalParts order in block matches array order (which it does by regex def)
                                blockContent = blockContent.replace(originalParts[i], newParts[i]);
                            }
                        }

                        updatedCode = tempCode.replace(match[0], blockContent);
                        changeMade = true;
                    }
                }
            }

            // Case B2: Structure Changed (Lines added/removed OR Match failed above)
            if (!changeMade && originalParts.length > 0) {
                // Find the bounds: Start of first part ... End of last part
                // We also indiscriminately gobble up closing tags around the last part 
                // to prevent orphaned tags (like </span>) if the user deleted the text inside.

                const firstPart = originalParts[0];
                const lastPart = originalParts[originalParts.length - 1];

                // Flexible regex to find the start and end
                // We assume these parts are relatively close to each other (within same element)
                const startPattern = escapeRegExp(firstPart);
                const endPattern = escapeRegExp(lastPart);

                // Matches: FirstPart ... (stuff) ... LastPart ... (optional closing inline tags)
                // We look ahead for closing tags like </span>, </b> etc to clear them if we are rewriting the block
                const blockRegex = new RegExp(
                    startPattern +
                    '[\\s\\S]*?' +
                    endPattern +
                    '(?:\\s*<\\/(?:span|strong|em|b|i|u|a)>)*',
                    'i' // Case insensitive match for tags
                );

                if (blockRegex.test(code)) {
                    // Safe replacement: Convert newlines to <br /> for JSX
                    const replacementText = newParts.join('<br />');
                    updatedCode = code.replace(blockRegex, replacementText);
                    changeMade = true;
                }
            }

            // Case B3: Last Resort - Simple Exact Match
            if (!changeMade) {
                // Try replacing just the original string raw
                // This might fail if the code has different whitespace than DOM
                if (code.includes(editingState.originalText)) {
                    const jsxSafeText = newText.replace(/\n/g, '<br />');
                    updatedCode = code.replace(editingState.originalText, jsxSafeText);
                    changeMade = true;
                }
            }
        }

        if (changeMade && updatedCode !== code) {
            onCodeChange(updatedCode);
        }

        // Cleanup
        if (editingTextNodeRef.current) {
            editingTextNodeRef.current = null;
        }
        setEditingState(null);
    }, [editingState, code, onCodeChange]);

    // Handle click on the slide container
    const handleClick = useCallback((e: React.MouseEvent) => {
        const container = containerRef.current;
        if (!container) return;

        // Use elementsFromPoint to find elements at click coordinates
        const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);

        // If already editing, check if clicking inside current overlay
        if (editingState && editableRef.current) {
            if (editableRef.current.contains(e.target as Node)) {
                return;
            }
            // Clicking elsewhere - save current edit
            stopEditing(true);
        }

        // Strategy 1: Find editable element from elements at click point
        // Only trigger if click is actually within the text element's bounds
        for (const el of elementsAtPoint) {
            if (!(el instanceof HTMLElement)) continue;
            if (!container.contains(el)) continue;

            const textElement = findEditableElement(el, container);
            if (textElement) {
                // Verify click is within the text element's actual bounds
                const textRect = textElement.getBoundingClientRect();
                const tolerance = 4; // small tolerance for edge clicks
                const isClickInsideText =
                    e.clientX >= textRect.left - tolerance &&
                    e.clientX <= textRect.right + tolerance &&
                    e.clientY >= textRect.top - tolerance &&
                    e.clientY <= textRect.bottom + tolerance;

                if (isClickInsideText) {
                    e.preventDefault();
                    e.stopPropagation();
                    startEditing(textElement);
                    return;
                }
            }
        }

        // Strategy 2: Fallback to current selection
        // This handles cases where layout (e.g. line-height) causes click to miss the element box
        // but the browser still performs native text selection (the "blue effect").
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
            const anchorNode = selection.anchorNode;
            const targetElement = anchorNode.nodeType === Node.TEXT_NODE
                ? anchorNode.parentElement
                : anchorNode as HTMLElement;

            if (targetElement && container.contains(targetElement)) {
                const textElement = findEditableElement(targetElement, container);
                if (textElement) {
                    // Verify click is within the text element's actual bounds
                    const textRect = textElement.getBoundingClientRect();
                    const tolerance = 4;
                    const isClickInsideText =
                        e.clientX >= textRect.left - tolerance &&
                        e.clientX <= textRect.right + tolerance &&
                        e.clientY >= textRect.top - tolerance &&
                        e.clientY <= textRect.bottom + tolerance;

                    if (isClickInsideText) {
                        e.preventDefault();
                        e.stopPropagation();
                        startEditing(textElement);
                        selection.removeAllRanges();
                        return;
                    }
                }
            }
        }

        // Strategy 3: Use caretRangeFromPoint for bare text nodes
        // This handles text nodes inside complex elements (with <br> or child elements)
        // that aren't directly editable but contain text we want to edit
        if ('caretRangeFromPoint' in document) {
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
                const textNode = range.startContainer as Text;
                const text = textNode.textContent?.trim() || '';

                // Only edit if text is substantial and inside our container
                if (text.length > 1 && container.contains(textNode)) {
                    // Verify the click is actually close to the text, not on empty space
                    // Get the bounding rect of the text node
                    const textRange = document.createRange();
                    textRange.selectNodeContents(textNode);
                    const textRect = textRange.getBoundingClientRect();

                    // Check if click is within reasonable distance of the text bounds
                    const tolerance = 10; // pixels
                    const isWithinTextBounds =
                        e.clientX >= textRect.left - tolerance &&
                        e.clientX <= textRect.right + tolerance &&
                        e.clientY >= textRect.top - tolerance &&
                        e.clientY <= textRect.bottom + tolerance;

                    if (isWithinTextBounds) {
                        e.preventDefault();
                        e.stopPropagation();
                        startEditingTextNode(textNode);
                        selection?.removeAllRanges();
                        return;
                    }
                }
            }
        }

        // Clear any accidental selection from clicking empty space
        selection?.removeAllRanges();
    }, [editingState, startEditing, startEditingTextNode, stopEditing]);


    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!editingState) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            stopEditing(false); // Cancel
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            stopEditing(true); // Save
        }
    }, [editingState, stopEditing]);

    // Handle click outside to save
    useEffect(() => {
        if (!editingState) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (editableRef.current && !editableRef.current.contains(e.target as Node)) {
                stopEditing(true);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [editingState, stopEditing]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full relative ${className}`}
            data-editable-slide="true"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
        >
            <LiveProvider code={processedCode} noInline={true} scope={{ React }}>
                <LivePreview className="w-full h-full" />
                <LiveError className="text-red-500 text-xs p-2 bg-red-50 absolute bottom-0 left-0 right-0" />
            </LiveProvider>

            {/* Editing overlay */}
            {editingState && (
                <div
                    ref={editableRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="absolute z-50 selection:bg-gray-400/30 selection:text-current"
                    style={{
                        left: editingState.rect.left,
                        top: editingState.rect.top,
                        width: editingState.rect.width,
                        minHeight: editingState.rect.height,
                        maxWidth: editingState.rect.width,
                        fontSize: editingState.fontSize,
                        fontWeight: editingState.fontWeight,
                        fontFamily: editingState.fontFamily,
                        fontStyle: editingState.fontStyle,
                        color: editingState.color,
                        textAlign: editingState.textAlign as 'left' | 'center' | 'right',
                        textTransform: editingState.textTransform as 'none' | 'uppercase' | 'lowercase' | 'capitalize',
                        lineHeight: editingState.lineHeight,
                        letterSpacing: editingState.letterSpacing,
                        padding: '4px 8px',
                        margin: '-4px -8px',
                        border: 'none',
                        outline: '2px dashed currentColor',
                        outlineOffset: '4px',
                        backgroundColor: 'transparent',
                        boxSizing: 'content-box',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        cursor: 'text',
                    }}
                >
                    {/* Render text with proper line breaks */}
                    {editingState.currentText.split('\n').map((line, index, array) => (
                        <React.Fragment key={index}>
                            {line}
                            {index < array.length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SLIDE THUMBNAIL
// =============================================================================

interface SlideThumbnailProps {
    children: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    slideNumber: number;
}

export function SlideThumbnail({ children, isActive, onClick, slideNumber }: SlideThumbnailProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.108);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                // Calculate scale to fit width (aspect-video ensures height will match)
                const newScale = containerWidth / 1920;
                setScale(newScale);
            }
        };

        updateScale();

        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col gap-1.5 group">
            <div
                ref={containerRef}
                onClick={onClick}
                className={`relative cursor-pointer transition-all aspect-video bg-white rounded-lg shadow-sm group-hover:shadow overflow-hidden ${isActive ? "border-2 border-brand" : "border border-gray-200 hover:bg-gray-50"
                    }`}
            >
                <div
                    className="pointer-events-none origin-top-left absolute top-0 left-0"
                    style={{
                        transform: `scale(${scale})`,
                        width: "1920px",
                        height: "1080px",
                    }}
                >
                    {children}
                </div>
            </div>
            <div className="text-center text-xs font-medium text-slate-400">
                {slideNumber}
            </div>
        </div>
    );
}

// =============================================================================
// SLIDE CODE THUMBNAIL
// =============================================================================

interface SlideCodeThumbnailProps {
    code: string;
    isActive: boolean;
    onClick: () => void;
    slideNumber: number;
}

export function SlideCodeThumbnail({ code, isActive, onClick, slideNumber }: SlideCodeThumbnailProps) {
    return (
        <SlideThumbnail isActive={isActive} onClick={onClick} slideNumber={slideNumber}>
            <SlideFromCode code={code} />
        </SlideThumbnail>
    );
}

// =============================================================================
// SCALED SLIDE WRAPPER
// =============================================================================

interface ScaledSlideProps {
    children: React.ReactNode | ((scale: number) => React.ReactNode);
}

export function ScaledSlide({ children }: ScaledSlideProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const containerHeight = containerRef.current.clientHeight;
                const scaleX = containerWidth / 1920;
                const scaleY = containerHeight / 1080;
                setScale(Math.min(scaleX, scaleY));
            }
        };

        // Initial scale
        updateScale();

        // Use ResizeObserver to detect container size changes (e.g. sidebar value toggle)
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden flex items-center justify-center">
            <div
                className="origin-center"
                style={{
                    transform: `scale(${scale})`,
                    width: "1920px",
                    height: "1080px",
                }}
            >
                {typeof children === 'function' ? children(scale) : children}
            </div>
        </div>
    );
}

// =============================================================================
// EDITABLE SCALED SLIDE
// =============================================================================

interface EditableScaledSlideProps {
    code: string;
    onCodeChange: (newCode: string) => void;
}

export function EditableScaledSlide({ code, onCodeChange }: EditableScaledSlideProps) {
    return (
        <ScaledSlide>
            {(scale) => (
                <EditableSlideFromCode
                    code={code}
                    onCodeChange={onCodeChange}
                    scale={scale}
                />
            )}
        </ScaledSlide>
    );
}
