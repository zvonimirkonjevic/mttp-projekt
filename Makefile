.PHONY: help flashslides-build flashslides-run flashslides-stop flashslides-logs flashslides-clear-cache flashslides-test flashslides-test-watch flashslides-test-coverage

help:
	@echo "Scripts."
	@echo ""
	@echo " ------------ FLASHSLIDES ------------"
	@echo " flashslides-build"
	@echo " Build local Flashslides images"
	@echo ""
	@echo " flashslides-run"
	@echo " Run local Flashslides images"
	@echo ""
	@echo " flashslides-stop"
	@echo " Stop local Flashslides images"
	@echo ""
	@echo " flashslides-logs"
	@echo " Show logs of local Flashslides images"
	@echo ""
	@echo " flashslides-test"
	@echo " Run frontend unit tests"
	@echo ""
	@echo " flashslides-test-watch"
	@echo " Run frontend tests in watch mode"
	@echo ""
	@echo " flashslides-test-coverage"
	@echo " Run frontend tests with coverage report"
	@echo ""
	@echo " flashslides-clear-cache"
	@echo " Clear cache in Flashslides images"
	@echo ""

flashslides-build:
	@echo "Building local Flashslides images..."
	docker-compose -f ./docker-compose.yml build

flashslides-run:
	@echo "Running local Flashslides images..."
	docker-compose -f ./docker-compose.yml up -d --force-recreate

flashslides-stop:
	@echo "Stopping local Flashslides images..."
	docker-compose -f ./docker-compose.yml down

flashslides-logs:
	@echo "Showing local Flashslides images logs..."
	docker-compose -f ./docker-compose.yml logs -f

flashslides-test:
	@echo "Running frontend unit tests..."
	cd src/app && npm test

flashslides-test-watch:
	@echo "Running frontend tests in watch mode..."
	cd src/app && npm run test:watch

flashslides-test-coverage:
	@echo "Running frontend tests with coverage..."
	cd src/app && npm run test:coverage

flashslides-clear-cache:
	@echo "Clearing Docker cache..."
	docker container stop $$(docker container ls -aq) || true
	docker container rm $$(docker container ls -aq) || true
	docker rmi $$(docker images -q) || true
	docker volume rm $$(docker volume ls -q) || true
	docker network rm $$(docker network ls -q) || true
	docker system prune -a --volumes
