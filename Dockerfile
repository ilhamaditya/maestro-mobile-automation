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
# in-place here.
#
# Runs as the "node" user/group (uid/gid 1000) that node:20-bookworm-slim
# already ships, rather than creating a new "maestro" one - confirmed by
# building this image, 2026-07-14: a `groupadd --gid 1000 maestro` here
# collides with that pre-existing group and fails the build (exit code 4).
#
# The Debian package that actually provides the `adb` binary is named `adb`
# - `android-sdk-platform-tools` is a same-sounding but different package
# (misc SDK utilities like mke2fs/sqlite3, not adb itself). Confirmed by
# building this image and finding `adb: not found` on PATH, 2026-07-14.
RUN apt-get update && apt-get install -y --no-install-recommends \
        openjdk-17-jre-headless \
        adb \
        curl \
        unzip \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL "https://get.maestro.mobile.dev" | bash \
    && chown -R node:node /opt/maestro

WORKDIR /workspace
COPY tools/package*.json tools/
RUN cd tools && npm install

COPY . .
RUN chown -R node:node /workspace

USER node

CMD ["bash"]
