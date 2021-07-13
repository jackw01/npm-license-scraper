#! /usr/bin/env node
// Copyright 2019 jackw01. Released under the MIT License (see LICENSE for details).

const crawler = require('npm-license-crawler');
const stripAnsi = require('strip-ansi');
const fs = require('fs');
const axios = require('axios');

crawler.dumpLicenses({
  start: ['.'],
  exclude: [],
  onlyDirectDependencies: true,
  omitVersion: true,
},
  function (error, licenses) {
    if (error) console.error('Error:', error);
    else {
      const entries = Object.entries(licenses);
      axios.all(entries.map(([key, value]) => axios.get(value.licenseUrl)))
      .then((result) => {
        const out = result.map((value, i) => {
          const license = value.data
            .replace(/\ +/g, ' ')
            .replace(/([^\n]) ?\n ?([^\n])/g, '$1 $2')
            .trim();
          return {
            name: stripAnsi(entries[i][0]),
            license,
          };
        })
        fs.writeFileSync('./licenses.json', JSON.stringify(out));
      });
    }
  }
);
