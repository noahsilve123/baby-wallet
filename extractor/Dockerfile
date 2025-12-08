FROM node:20-slim

WORKDIR /usr/src/extractor

# Install system deps recommended for OCR (Tesseract) and model runtimes as needed.
# You may need to customize this with distro packages for your model runner.
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  ca-certificates \
  libpng-dev \
  tesseract-ocr \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install production deps
# Copy package manifests and install production deps. Fail build if install fails.
COPY package.json package-lock.json ./
ENV NODE_ENV=production
# Use npm install in the Docker build to avoid failures when the lockfile
# and package.json are out of sync. For a permanent fix regenerate and
# commit an updated package-lock.json from your development machine.
RUN npm install --production --no-audit --no-fund

# Copy your extractor server implementation here (implement `server.js` to wire AI pipeline)
COPY ./extractor/server.js ./server.js
COPY ./extractor/pipeline.js ./pipeline.js
COPY ./extractor/extractionRules.js ./extractionRules.js

EXPOSE 8080

# Healthcheck: use node to probe the local HTTP endpoint so Render/other orchestrators can verify readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:8080/',res=>{process.exit(res.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
