FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY apps/worker/package.json ./package.json
RUN npm install --include=dev
COPY apps/worker/tsconfig.json ./tsconfig.json
COPY apps/worker/src ./src
ENV NODE_ENV=production
CMD ["npm","start"]
