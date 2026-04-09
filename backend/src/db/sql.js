const { Connection, Request, TYPES } = require('tedious');

const config = {
  server: process.env.SQL_SERVER,
  authentication: {
    type: 'default',
    options: {
      userName: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD
    }
  },
  options: {
    database: process.env.SQL_DATABASE,
    encrypt: true,
    trustServerCertificate: false
  }
};

function getConnection() {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);
    connection.on('connect', (err) => {
      if (err) reject(err);
      else resolve(connection);
    });
    connection.connect();
  });
}

function executeQuery(query, params = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const connection = await getConnection();
      const results = [];
      const request = new Request(query, (err) => {
        if (err) reject(err);
        else resolve(results);
        connection.close();
      });
      params.forEach(({ name, type, value }) => {
        request.addParameter(name, type, value);
      });
      request.on('row', (columns) => {
        const row = {};
        columns.forEach((col) => { row[col.metadata.colName] = col.value; });
        results.push(row);
      });
      connection.execSql(request);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { executeQuery, TYPES };