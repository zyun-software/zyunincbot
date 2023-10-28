#!/usr/bin/make

.PHONY: build node-sh down clean dev prod

SHELL = /bin/sh

CURRENT_UID := $(shell id -u)
CURRENT_GID := $(shell id -g)

export CURRENT_UID
export CURRENT_GID

ifneq (,$(wildcard ./.env))
	include .env
	export
endif

build:
	docker compose build --no-cache
	docker compose run --rm node yarn

node-sh:
	docker compose run --rm node sh

down:
	docker compose down --remove-orphans

clean:
	docker compose down --remove-orphans -v

dev:
	docker compose up -d postgres
	sleep 5
	docker compose up flyway dev

prod:
	docker compose up -d postgres
	sleep 5
	docker compose up -d flyway prod
