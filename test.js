import TeleBot from 'telebot';
import dotenv from 'dotenv'
import { JWT } from 'google-auth-library'
import { google } from 'googleapis';
import dayjs from "dayjs"
dotenv.config()

let newRow = {}

const jwtClient = new JWT({
  email: process.env.google_mail,
  key: process.env.google_key,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

jwtClient.authorize(function(err) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Successfully connected!");
  }
});

let spreadsheetId = process.env.table_token;
let sheets = google.sheets('v4');

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}


const tableCall = (newCellData) => {
  sheets.spreadsheets.get({
    auth: jwtClient,
    spreadsheetId: spreadsheetId,
  }, function(err, response) {
    if (err) console.log('The API returned an error: ' + err);
    const lastSheet = response.data.sheets[response.data.sheets.length - 1].properties.sheetId
    const sheetName = response.data.sheets[response.data.sheets.length - 1].properties.title
    sheets.spreadsheets.values.get({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      range: sheetName + "!A:Z"
    }, function(err, data) {
      if (err) {
        console.log('The API returned an error: ' + err);
      } else {
        console.log('Movie list from Google Sheets:');
        const lastRow = (data.data.values[data.data.values.length - 1])
        console.log(lastRow)
        let color = "#ffffff"
        let newCategory = null
        let negative = false

        if (newCellData.category === "💸 eating out") {
          color = "#b4a7d6"
        } else if (newCellData.category === "💸 food") {
          color = "#8e7cc3"
        } else if (newCellData.category === "💸 public transport") {
          color = "#d5a6bd"
        } else if (newCellData.category === "💸 taxi") {
          color = "#c27ba0"
        } else if (newCellData.category === "💸 subs") {
          color = "#3d85c6"
        } else if (newCellData.category === "💸 tech") {
          color = "#6d9eeb"
        } else if (newCellData.category === "💸 shopping") {
          color = "#ffe598"
        } else if (newCellData.category === "💸 services") {
          color = "#ffd966"
        } else if (newCellData.category === "💸 chill") {
          color = "#f9cb9c"
        } else if (newCellData.category === "💸 travel") {
          color = "#f6b26b"
        } else if (newCellData.category === "💵 salary") {
          color = "#b6d7a8"
          negative = true
        } else if (newCellData.category === "💵 famaly") {
          color = "#a2c4c9"
          negative = true
        } else if (newCellData.category === "💵 gifts") {
          color = "#76a5af"
          negative = true
        } else if (newCellData.category === "💵 returns") {
          color = "#d0e0e3"
          negative = true
        } else if (newCellData.category === "💵 sells") {
          color = "#6aa84f"
          negative = true
        } else if (newCellData.category) {
          color = "#cccccc"
          newCategory = newCellData.category
          negative = true
        } else {
          negative = true
        }

        newCellData.val = negative ? newCellData.val : 0 - newCellData.val

        let emoji = newCellData.val > 0 ? "💵" : "💸"
        let currency = newCellData.curr == 'usd' ? " ($)" : newCellData.curr == 'eur' ? " (€)" : newCellData.curr == 'czk' ? " (Kč)" : ""
        let ifNoDescriptoin = `${emoji}${currency} ${newCellData.category.slice(3)}`
        let descrip = newCellData.descrip ? `${emoji}${currency} ${newCellData.descrip}` : ifNoDescriptoin

        sheets.spreadsheets.batchUpdate({
          auth: jwtClient,
          spreadsheetId: spreadsheetId,
          requestBody: {
            requests: [
              {
                appendCells: {
                  fields: "userEnteredValue, userEnteredFormat",
                  sheetId: lastSheet,
                  rows: [{
                    values: [
                      {
                        userEnteredValue: {
                          stringValue: dayjs().format('DD.MM/HH:mm')
                        }
                      },
                      {
                        userEnteredValue: {
                          numberValue: Number(lastRow[1].replace(',', '.')) + (newCellData.curr == 'usd' ? newCellData.val : 0)
                        }
                      },
                      {
                        userEnteredFormat: newCellData.curr == "usd" ? {
                          backgroundColor: {
                            red: hexToRgb(color).r,
                            green: hexToRgb(color).g,
                            blue: hexToRgb(color).b
                          }
                        } : null,
                        userEnteredValue: {
                          numberValue: newCellData.curr == 'usd' ? newCellData.val : 0
                        }
                      },
                      {
                        userEnteredValue: {
                          numberValue: Number(lastRow[3].replace(',', '.')) + (newCellData.curr == 'eur' ? newCellData.val : 0)
                        }
                      },
                      {
                        userEnteredFormat: newCellData.curr == "eur" ? {
                          backgroundColor: {
                            red: hexToRgb(color).r,
                            green: hexToRgb(color).g,
                            blue: hexToRgb(color).b
                          }
                        } : null,
                        userEnteredValue: {
                          numberValue: newCellData.curr == 'eur' ? newCellData.val : 0
                        }
                      },
                      {
                        userEnteredValue: {
                          numberValue: Number(lastRow[5].replace(',', '.')) + (newCellData.curr == 'czk' ? newCellData.val : 0)
                        }
                      },
                      {
                        userEnteredFormat: newCellData.curr == "czk" ? {
                          backgroundColor: {
                            red: hexToRgb(color).r,
                            green: hexToRgb(color).g,
                            blue: hexToRgb(color).b
                          }
                        } : null,
                        userEnteredValue: {
                          numberValue: newCellData.curr == 'czk' ? newCellData.val : 0
                        }
                      },
                      {
                        userEnteredValue: {
                          stringValue: descrip
                        }
                      },
                      {
                        userEnteredValue: {
                          stringValue: newCategory
                        }
                      }
                    ]
                  }]
                }
              }
            ]
          }
        }, function(err, response) {
          if (err) {
            console.log('The API returned an error: ' + err);
          } else {
            console.log('done?')
          }
        });
      }
    });
  });
}

var bot = new TeleBot({
  token: process.env.telekey,
  sleep: 1000, // How often check updates (in ms)
  timeout: 0, // Update pulling timeout (0 - short polling)
  limit: 100, // Limits the number of updates to be retrieved
  retryTimeout: 5000 // Reconnecting timeout (in ms)
});

bot.on('/add', function(msg) {
  console.log(1)
  if (msg.chat.id === 707939820) {
    newRow = {}
    var id = msg.from.id;
    return bot.sendMessage(id, 'Select currency', {
      replyMarkup: {
        inline_keyboard: [
          [{ text: "kč / czk", callback_data: "czk" }, { text: "$ / usd", callback_data: "usd" }, { text: "€ / eur", callback_data: 'eur' }],
        ]
      }
    }
    );
  }
});

bot.on('/start', function(msg) {
  console.log(1)
  if (msg.chat.id === 707939820) {
    var id = msg.from.id;
    newRow = {}
    return bot.sendMessage(id, 'use /add to add new position, \n use /clear to clear cache data');
  }
});

bot.on('/clear', function(msg) {
  console.log(1)
  if (msg.chat.id === 707939820) {
    var id = msg.from.id;
    newRow = {}
    return bot.sendMessage(id, 'done');
  }
});

bot.on('text', function(msg) {
  console.log(msg)
  if (msg.chat.id === 707939820) {
    if (msg.text !== '/add' && msg.text !== '/clear') {
      var id = msg.from.id;
      if (newRow.category && newRow.curr) {
        newRow.val = Number(msg.text.split(' ')[0].replace(',', '.'))
        newRow.descrip = msg.text.split(' ')[1]
        tableCall(newRow)
        newRow = {}
        return bot.sendMessage(id, 'Done! Use /add to add new position');
      } else {
        return bot.sendMessage(id, 'Err! Use /clear to clear stucked position');
      }
    }
  }
});

bot.on('callbackQuery', (msg) => {
  if (msg.data == 'czk') {
    newRow.curr = 'czk'
  } else if (msg.data == 'eur') {
    newRow.curr = 'eur'
  } else if (msg.data == 'usd') {
    newRow.curr = 'usd'
  }

  if (msg.data.length == 3) {
    var id = msg.from.id;
    return bot.sendMessage(id, 'Select category', {
      replyMarkup: {
        inline_keyboard: [
          [
            { text: "💸 eating out", callback_data: "💸 eating out" },
            { text: "💸 food", callback_data: "💸 food" },
          ], [
            { text: "💸 transport", callback_data: "💸 public transport" },
            { text: "💸 travel", callback_data: "💸 travel" }
          ],
          [
            { text: "💸 subs", callback_data: "💸 subs" },
            { text: "💸 tech", callback_data: "💸 tech" }
          ],
          [
            { text: "💸 shopping", callback_data: "💸 shopping" },
            { text: "💸 services", callback_data: "💸 services" }
          ],
          [
            { text: "💵 salary", callback_data: "💵 salary" },
            { text: "💵 returns", callback_data: "💵 returns" }
          ],
          [
            { text: "No category", callback_data: "No category" }
          ]
        ].reverse()
      }
    })
  }

  newRow.category = msg.data

  var id = msg.from.id;
  return bot.sendMessage(id, 'Write amount please (u can add description in the message if you want to. separate number and text by space)')
})

bot.connect();
