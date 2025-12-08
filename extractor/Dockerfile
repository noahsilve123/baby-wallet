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
RUN npm ci --production

# Copy your extractor server implementation here (implement `server.js` to wire AI pipeline)
COPY ./extractor/server.js ./server.js
COPY ./extractor/pipeline.js ./pipeline.js
COPY ./extractor/extractionRules.js ./extractionRules.js

EXPOSE 8080

CMD ["node", "server.js"]
