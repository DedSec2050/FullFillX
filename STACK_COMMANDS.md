# FullFillX startup commands

## 1) Create the network

```bash
podman network create fulfillx-network 2>/dev/null || true
```

## 2) Start PostgreSQL

```bash
podman run -d \
  --name fulfillx-postgres \
  --network fulfillx-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fullfillx \
  -v fulfillx-postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

If the database does not exist yet, create it:

```bash
podman exec -it fulfillx-postgres sh -lc "psql -U postgres -d postgres -c \"CREATE DATABASE fulfillx;\""
```

## 3) Build the API image

```bash
podman build -f Containerfile.api -t fulfillx-api:latest .
```

## 4) Start the API container

```bash
podman rm -f fulfillx-api 2>/dev/null || true
podman run -d \
  --name fulfillx-api \
  --network fulfillx-network \
  -e DATABASE_URL="postgresql://postgres:postgres@fulfillx-postgres:5432/fulfillx" \
  -p 3000:3000 \
  -p 5555:5555 \
  fulfillx-api:latest
```

## 5) Open Prisma Studio

```bash
podman exec -it fulfillx-api sh -lc 'pnpm prisma studio --url "postgresql://postgres:postgres@fulfillx-postgres:5432/fulfillx" --port 5555 --browser none'
```

Then open in the browser:

```text
http://localhost:5555
```

## 6) Build and start the frontend

```bash
podman build -f Containerfile.web -t fulfillx-web:latest .
podman rm -f fulfillx-web 2>/dev/null || true
podman run -d \
  --name fulfillx-web \
  --network fulfillx-network \
  -p 8080:80 \
  fulfillx-web:latest
```

Then open in the browser:

```text
http://localhost:8080
```

## 7) Useful health checks

```bash
curl http://localhost:3000/health
curl http://localhost:8080/health
```

## 8) Important networking rule

- Use `localhost` when calling from the host machine
- Use `fulfillx-postgres` when calling from another container on the same network
- Do not use `localhost` inside a container to reach another container
