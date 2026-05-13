# Stage 1 – Install dependencies and build Next.js
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# NEXT_PUBLIC_ variables are baked in at build time (the browser calls this URL)
ARG NEXT_PUBLIC_GATEWAY_URL=http://localhost:8080/api
ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL

RUN npm run build

# Stage 2 – Minimal runtime image using Next.js standalone output
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static  ./.next/static
COPY --from=build /app/public        ./public

EXPOSE 3000
CMD ["node", "server.js"]
