const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const userFilePath = path.join(__dirname, 'user.json');

function readUsers() {
  try {
    const data = fs.readFileSync(userFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), 'utf8');
}

app.get('/formulaire', (req, res) => {
  const { name, groupe, etidian } = req.query;
  if (name && groupe && etidian) {
    let users = readUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    users.push({ id: newId, name, groupe, etidian });
    writeUsers(users);
    return res.redirect('/formulaire');
  }

  const users = readUsers();

  const tableRows = users.map(u => `
    <tr>
      <td data-label="ID">${escapeHtml(String(u.id))}</td>
      <td data-label="Nom">${escapeHtml(u.name)}</td>
      <td data-label="Groupe">${escapeHtml(u.groupe)}</td>
      <td data-label="Statut">${escapeHtml(u.etidian)}</td>
      <td data-label="Actions" class="action-cell">
        <a href="/delete/${u.id}" class="delete-btn" onclick="return confirm('Supprimer cet utilisateur ?')">Supprimer</a>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gestion des utilisateurs</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          background: #000000;
          color: #ffffff;
          line-height: 1.5;
          padding: 40px 20px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: #0a0a0a;
          border: 1px solid #222;
        }

        .header {
          background: #000;
          padding: 30px;
          text-align: center;
          border-bottom: 2px solid #fff;
        }

        .header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .header p {
          font-size: 14px;
          color: #aaa;
        }

        .form-section {
          padding: 30px;
          border-bottom: 1px solid #222;
        }

        .form-section h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          border-left: 4px solid #fff;
          padding-left: 12px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 14px;
          color: #ccc;
        }

        input {
          width: 100%;
          padding: 12px;
          background: #111;
          border: 1px solid #333;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          border-radius: 4px;
        }

        input:focus {
          outline: none;
          border-color: #fff;
        }

        button {
          background: #fff;
          color: #000;
          border: none;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          width: 100%;
        }

        button:hover {
          background: #ddd;
        }

        .users-section {
          padding: 30px;
        }

        .users-section h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          border-left: 4px solid #fff;
          padding-left: 12px;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
        }

        .user-table th {
          background: #111;
          color: #fff;
          font-weight: 600;
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #333;
        }

        .user-table td {
          padding: 12px;
          border-bottom: 1px solid #222;
          color: #eee;
        }

        .user-table tr:hover td {
          background: #111;
        }

        .action-cell {
          text-align: center;
        }

        .delete-btn {
          background: transparent;
          color: #fff;
          border: 1px solid #fff;
          padding: 4px 12px;
          text-decoration: none;
          font-size: 12px;
          border-radius: 4px;
        }

        .delete-btn:hover {
          background: #fff;
          color: #000;
        }

        .empty-message {
          text-align: center;
          color: #666;
          padding: 30px;
        }

        .json-link {
          display: inline-block;
          margin-top: 20px;
          color: #fff;
          text-decoration: none;
          border-bottom: 1px solid #fff;
          padding-bottom: 2px;
          font-size: 14px;
        }

        .json-link:hover {
          color: #ccc;
          border-bottom-color: #ccc;
        }

        @media (max-width: 768px) {
          .user-table, .user-table thead, .user-table tbody, .user-table th, .user-table td, .user-table tr {
            display: block;
          }
          .user-table th {
            display: none;
          }
          .user-table tr {
            margin-bottom: 15px;
            border: 1px solid #222;
            padding: 8px;
          }
          .user-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #222;
            padding: 8px 5px;
          }
          .user-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #aaa;
            width: 40%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Gestion des utilisateurs</h1>
          <p>Ajouter et supprimer des utilisateurs</p>
        </div>

        <div class="form-section">
          <h2>Ajouter un utilisateur</h2>
          <form method="GET" action="/formulaire">
            <div class="form-group">
              <label>Nom</label>
              <input type="text" name="name" placeholder="ex: Jean Dupont" required>
            </div>
            <div class="form-group">
              <label>Groupe</label>
              <input type="text" name="groupe" placeholder="ex: dev123" required>
            </div>
            <div class="form-group">
              <label>Statut</label>
              <input type="text" name="etidian" placeholder="ex: développeur" required>
            </div>
            <button type="submit">Ajouter</button>
          </form>
        </div>

        <div class="users-section">
          <h2>Liste des utilisateurs (${users.length})</h2>
          ${users.length === 0 ? '<div class="empty-message">Aucun utilisateur</div>' : `
            <table class="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Groupe</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          `}
          <div style="margin-top: 20px;">
            <a href="/user" class="json-link" target="_blank">Voir les données JSON</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

app.get('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let users = readUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length !== users.length) writeUsers(filtered);
  res.redirect('/formulaire');
});

app.get('/user', (req, res) => {
  res.json(readUsers());
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

function escapeHtml(str) {
  return String(str).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}