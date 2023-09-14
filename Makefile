build:
	docker build -t interview .

run:
	docker run -d -p 3000:3000 --name interview --rm interview