.PHONY: install migrate dev-api dev-web lint test build check

install:
	python3 -m venv .venv
	.venv/bin/pip install -r backend/requirements/dev.txt
	cd frontend && npm install

migrate:
	.venv/bin/python backend/manage.py migrate

dev-api:
	.venv/bin/python backend/manage.py runserver 127.0.0.1:8000

dev-web:
	cd frontend && npm run dev

lint:
	.venv/bin/ruff check backend
	cd frontend && npm run lint && npm run typecheck

test:
	.venv/bin/pytest
	cd frontend && npm test

build:
	cd frontend && npm run build

check: lint test build
