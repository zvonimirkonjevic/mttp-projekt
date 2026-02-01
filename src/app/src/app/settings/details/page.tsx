"use client";

import { UploadCloud, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

// Zod Schema
const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    company: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.newPassword && data.newPassword.length < 8) {
        return false;
    }
    return true;
}, {
    message: "New password must be at least 8 characters",
    path: ["newPassword"],
}).refine((data) => {
    if (data.newPassword !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function DetailsPage() {
    const { user, refreshProfile } = useUser();
    const { profile, updateProfile, isUpdating } = useUserProfile();
    const { uploadAvatar, isUploading } = useAvatarUpload();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            company: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Sync form with profile data
    useEffect(() => {
        if (profile) {
            reset({
                firstName: profile.first_name || "",
                lastName: profile.last_name || "",
                email: user?.email || "",
                company: profile.company || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } else if (user?.email) {
            setValue("email", user.email);
        }
    }, [profile, user, reset, setValue]);

    const onSubmit = async (data: ProfileFormData) => {
        try {
            let successCount = 0;

            // 1. Handle Profile Update (Optimistic)
            // Only update if profile exists and values have actually changed
            // Normalize empty strings and null for comparison
            const normalizeValue = (val: string | null | undefined) => val || null;
            const hasProfileChanges = profile && (
                normalizeValue(data.firstName) !== normalizeValue(profile?.first_name) ||
                normalizeValue(data.lastName) !== normalizeValue(profile?.last_name) ||
                normalizeValue(data.company) !== normalizeValue(profile?.company)
            );

            if (hasProfileChanges) {
                try {
                    await updateProfile({
                        first_name: data.firstName,
                        last_name: data.lastName,
                        company: data.company,
                    });
                    successCount++;
                } catch (profileError) {
                    console.error("Profile update failed:", profileError);
                    // Don't stop execution - continue to email/password updates
                    toast.error("Failed to update profile information");
                }
            }

            // 2. Handle Email Update
            if (data.email !== user?.email) {
                // Check if email is already taken via backend API
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.access_token) {
                        toast.error("No active session");
                        return;
                    }

                    const apiUrl = "http://localhost:3001";
                    const response = await fetch(
                        `${apiUrl}/check_email_availability?email=${encodeURIComponent(data.email)}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${session.access_token}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Failed to check email availability");
                    }

                    const result = await response.json();

                    if (!result.is_available) {
                        toast.error("This email is already taken");
                        return; // Stop here
                    }
                } catch (error) {
                    console.error("Email availability check failed:", error);
                    toast.error("Failed to verify email availability");
                    return;
                }

                const { error: emailError } = await supabase.auth.updateUser({ email: data.email });

                if (emailError) {
                    toast.error(emailError.message || "Failed to update email");
                    return; // Stop here
                }

                toast.info("Confirmation email sent to new address");
                successCount++;
            }

            // 3. Handle Password Update
            if (data.newPassword) {
                if (!data.currentPassword) {
                    toast.error("Current password is required to set a new password");
                    return; // Stop here
                }

                // Verify current password before allowing change
                const { error: verifyError } = await supabase.auth.signInWithPassword({
                    email: data.email,
                    password: data.currentPassword,
                });

                if (verifyError) {
                    toast.error("Current password is incorrect");
                    return; // Stop here
                }

                // Current password verified, proceed with password update
                const { error: passwordError } = await supabase.auth.updateUser({ password: data.newPassword });

                if (passwordError) {
                    toast.error(passwordError.message || "Failed to update password");
                    return; // Stop here
                }

                toast.success("Password updated");
                successCount++;
            }

            if (successCount > 0) {
                toast.success("Settings saved!");
                // Refresh UserContext to update sidebar and other components
                await refreshProfile();
                // Reset form to clear dirty state and remove blue background on edited fields
                reset({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    company: data.company,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            console.error("Update failed", error);
            const message = error instanceof Error ? error.message : "Failed to update settings"
            toast.error(message);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Optimistic UI for Avatar?
        // We can show a local preview immediately, but `uploadAvatar` is fast.
        // Let's rely on the spinner for upload, then immediate profile update.
        // Or better: read as data URL for preview.

        try {
            const publicUrl = await uploadAvatar(file);

            // Immediate update to backend
            await updateProfile({ avatar_url: publicUrl });
            // Refresh UserContext to update sidebar and other components
            await refreshProfile();
            toast.success("Profile photo updated!");
        } catch {
            toast.error("Failed to upload photo");
        }
    };

    return (
        <div className="w-full max-w-3xl">
            <h1 className="text-2xl font-light text-navy tracking-tight mb-8">Account Settings</h1>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
                <div className="space-y-6">
                    {/* Profile Photo */}
                    <div>
                        <label className="block text-xs text-slate uppercase tracking-widest font-medium mb-3">Profile Photo</label>
                        <div className="flex items-center gap-6">
                            <div className="relative w-20 h-20 rounded-full bg-[#F5F7FA] border border-gray-100 flex items-center justify-center text-slate text-xl font-medium overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    (profile?.first_name || profile?.last_name) ?
                                        `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() :
                                        <UploadCloud size={32} />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-white" size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <button
                                    onClick={handleAvatarClick}
                                    disabled={isUploading}
                                    type="button"
                                    className="px-4 py-2 bg-white border border-gray-200 text-navy text-sm rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors self-start disabled:opacity-50"
                                >
                                    {isUploading ? 'Uploading...' : 'Upload photo'}
                                </button>
                                <p className="text-xs text-slate">Recommended 400x400px, JPG or PNG.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs text-slate uppercase tracking-widest font-medium mb-2">First Name</label>
                                <input
                                    type="text"
                                    {...register("firstName")}
                                    className="w-full px-4 py-2.5 bg-[#F5F7FA] border border-gray-100 rounded-xl text-sm text-navy focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs text-slate uppercase tracking-widest font-medium mb-2">Last Name</label>
                                <input
                                    type="text"
                                    {...register("lastName")}
                                    className="w-full px-4 py-2.5 bg-[#F5F7FA] border border-gray-100 rounded-xl text-sm text-navy focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                                />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-6">
                            <label className="block text-xs text-slate uppercase tracking-widest font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                {...register("email")}
                                className="w-full px-4 py-2.5 bg-[#F5F7FA] border border-gray-100 rounded-xl text-sm text-navy focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Company (Optional) */}
                        <div className="mb-6">
                            <label className="block text-xs text-slate uppercase tracking-widest font-medium mb-2">Company <span className="text-slate/60 normal-case">(optional)</span></label>
                            <input
                                type="text"
                                {...register("company")}
                                placeholder="Company Name"
                                className="w-full px-4 py-2.5 bg-[#F5F7FA] border border-gray-100 rounded-xl text-sm text-navy focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="border-t border-gray-100 my-6"></div>

                        {/* Password Change Section */}
                        <div className="mb-6">
                            <h3 className="text-base font-medium text-navy mb-4 flex items-center gap-2">
                                <Lock size={16} className="text-slate" />
                                Change Password
                            </h3>

                            <div className="space-y-4">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-xs text-slate uppercase tracking-widest font-medium mb-2">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("currentPassword")}
                                            placeholder="Enter current password to change password"
                                            className="w-full px-4 py-2.5 bg-[#F5F7FA] border border-gray-100 rounded-xl text-sm text-navy focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-navy transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* New Password */}
                                    <div>
                                        <label className="block text-xs text-slate uppercase tracking-widest font-medium mb-2">New Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("newPassword")}
                                            className={`w-full px-4 py-2.5 bg-[#F5F7FA] border rounded-xl text-sm text-navy focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all ${errors.newPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-100'
                                                }`}
                                        />
                                        {errors.newPassword && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.newPassword.message}</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-xs text-slate uppercase tracking-widest font-medium mb-2">Confirm New Password</label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("confirmPassword")}
                                            className={`w-full px-4 py-2.5 bg-[#F5F7FA] border rounded-xl text-sm text-navy focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all ${errors.confirmPassword ? 'border-red-300 focus:ring-red-200' : 'border-gray-100'
                                                }`}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-[10px] text-red-500 mt-1">{errors.confirmPassword.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUpdating && <Loader2 size={16} className="animate-spin" />}
                                Save changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl border border-red-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                <h2 className="text-base font-medium text-navy mb-1">Delete Account</h2>
                <p className="text-sm text-slate mb-6 max-w-lg">
                    Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm rounded-full hover:bg-red-50 hover:border-red-300 transition-all">
                    Delete account
                </button>
            </div>
        </div>
    );
}
