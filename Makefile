
all:
	@docker compose -f docker-compose.yml  up -d

restart-db:
	@docker compose -f docekr-compose.yml restart database;

build:
	@docker compose -f docker-compose.yml  up -d --build

clean:
	@docker compose -f docker-compose.yml  down
	
re: clean all

.PHONY: all clean fclean re build
