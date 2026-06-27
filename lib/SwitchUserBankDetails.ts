/*
** Lookup account name for a given institution account number or phone number.
** @param bankCode - The bank code of the institution.
** @param accountNumber - The account number of the institution.
** @returns The account name of the institution.
*/
export const SwitchUserBankDetails = async (bankCode: string, accountNumber: string) => {
  const switchKey = process.env.SWITCH_LIVE_KEY;
  if (!switchKey) {
    throw new Error("Switch key not found");
  }
  const response = await fetch('https://api.onswitch.xyz/institution/lookup', {
    method: 'POST',
    headers: {
      "X-Service-Key": switchKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "country": "NG",
      "beneficiary": {
        "bank_code": bankCode, //eg: 0014
        "account_number": accountNumber //eg: 1234567890
      }
    })
  });

  const data = await response.json();
  return data;
}

//SAMPLE SUCCESSFUL RESPONSE
// {
//   "success": true,
//     "status": 200,
//       "message": "Institution lookup successful",
//         "timestamp": "2024-01-01T00:00:00.000Z",
//           "data": {
//     "account_name": "John Doe"
//   }
// }