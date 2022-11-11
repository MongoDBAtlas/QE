#!/usr/bin/env bash
#
# Bash script for provisioning the MongoDB instances

set -e
set -x

function init(){
  echo "alias ls='ls -F --color=auto'" >> /root/.bashrc
  echo "alias ll='ls -l'" >> /root/.bashrc
  echo "alias l='ls'" >> /root/.bashrc
  echo "alias a='ls -a'" >> /root/.bashrc
  echo "alias la='ls -la'" >> /root/.bashrc

  if [ ! -f "${CMK}" ]; then
    openssl rand 96 > ${CMK}
  fi
}

init
echo "DONE"
