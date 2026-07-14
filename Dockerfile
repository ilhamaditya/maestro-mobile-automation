# Reproducible local/CI tooling runtime: Node + Java + Maestro CLI + adb
# client. Deliberately NOT a containerized emulator/simulator - see
# docs/CI-CD.md and docs/future/DockerGuide.md for why:
#   - iOS Simulator cannot run in a Linux container under any configuration
#     (Xcode is macOS-only).
#   - Android-in-Docker has a known Maestro-specific device-detection
#     flakiness issue; CI runs Android natively on the GitHub-hosted runner
#     instead (see .github/workflows/smoke.yml).
# This image's purpose is reproducible developer/CI tooling parity: connect
# it to a device/emulator already running on the host via `adb connect`.
#
# Real secrets are never baked in: .dockerignore excludes every non-.example
# env file, .git, and node_modules from the build context entirely.

FROM node:20-bookworm-slim

ARG MAESTRO_VERSION=1.39.7

ENV MAESTRO_VERSION=${MAESTRO_VERSION} \
    MAESTRO_DIR=/opt/maestro \
    PATH=/opt/maestro/bin:$PATH

# The official install script honors MAESTRO_DIR/MAESTRO_VERSION (confirmed
# by reading get.maestro.mobile.dev, 2026-07-14), installing pinned and
# in-place here. Also creates the non-root "maestro" user this image runs as.
RUN apt-get update && apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless \
        android-sdk-platform-tools \
        curl \
        unzip \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL "https://get.maestro.mobile.dev" | bash \
    && groupadd --gid 1000 maestro \
    && useradd --uid 1000 --gid maestro --shell /bin/bash --create-home maestro \
    && chown -R maestro:maestro /opt/maestro

WORKDIR /workspace
COPY tools/package*.json tools/
RUN cd tools && npm install

COPY . .
RUN chown -R maestro:maestro /workspace

USER maestro

CMD ["bash"]
