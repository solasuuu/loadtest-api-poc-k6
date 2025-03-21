const request_json = JSON.parse(await Bun.file('./request.json').text())


// {
//   "auth": {
//     "type": "basic",
//     "basic": [
//       {
//         "key": "password",
//         "value": "bb",
//         "type": "string"
//       },
//       {
//         "key": "username",
//         "value": "aa",
//         "type": "string"
//       }
//     ]
//   }
// }