FROM node:9.4.0-alpine

USER root

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      chromium@edge \
      nss@edge \
      yarn \
      shadow

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Add user so we don't need --no-sandbox.
# Change to the app user.
RUN addgroup -S app && adduser -S -g app app \
    && mkdir -p /home/app/Downloads \
    && mkdir -p /app \
    && chown -R app:app /home/app \
    && chown -R app:app /app

WORKDIR /home/app

USER app

ADD package.json .
RUN yarn

ADD . $HOME

ENTRYPOINT [ "./dist/CommandLine.js" ]
