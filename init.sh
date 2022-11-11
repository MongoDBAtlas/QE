#!/usr/bin/env bash
#
# Bash script for provisioning the MongoDB instances

set -e
set -x

function init(){
  echo "alias ls='ls -F --color=auto'" >> ${HOME}/.bashrc
  echo "alias ll='ls -l'" >> ${HOME}/.bashrc
  echo "alias l='ls'" >> ${HOME}/.bashrc
  echo "alias a='ls -a'" >> ${HOME}/.bashrc
  echo "alias la='ls -la'" >> ${HOME}/.bashrc

  if [ ! -f "${CMK}" ]; then
    openssl rand 96 > ${CMK}
  fi
}

init
echo "DONE"
