FROM debian:bullseye-slim

# Install chrony and required packages
RUN apt-get update && \
    apt-get install -y chrony && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create chrony user and directories
RUN mkdir -p /var/lib/chrony /var/log/chrony && \
    chown -R _chrony:_chrony /var/lib/chrony /var/log/chrony

# Copy configuration
COPY chrony.conf /etc/chrony/chrony.conf

# Expose NTP port
EXPOSE 123/udp

# Set timezone
ENV TZ=UTC

# Run chrony in foreground
CMD ["chronyd", "-d", "-s"]
