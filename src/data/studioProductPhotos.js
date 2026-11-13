// A changed source photo in the CMS invalidates its old derivative.
const studioSources = {
  "MODEL-1": "cd1c4703-ccd2-4c1b-bb5f-c37df4fe6931.jpg",
  "MODEL-2": "949e89c8-10ab-4b8a-87f2-ef1dc69a44bc.jpg",
  "MODEL-3": "2b6de4f0-d79b-4495-a3b4-6d33fad19eb8.jpg",
  "MODEL-4": "0ea4994c-80c0-44d0-9040-cdce53b6b91e.jpg"
};
const interiorSources = {
  "BTC103S-2": "23f159e8-eb81-4349-9094-1dde48f1e3fa.jpg",
  "BTC103S-5": "6dcf3c09-b92e-4349-81b7-de930edbb1bc.jpg",
  "BTC103S-6": "7fc96830-2246-4214-836b-02cabe9381de.jpg",
  "BTC103S": "d1a9dd0b-cdfd-46b1-8761-a5563a5b899a.jpg",
  "BTC103SGQ": "9adc76dc-271a-45a6-8813-e434664b5cf9.jpg",
  "BTC103SH-2": "10f8f3ee-e471-47a4-a70b-c58b36428d25.jpg",
  "BTC103SY-5": "2e286ae8-ebd8-4cd8-ba38-803ff213ea51.jpg",
  "BTC103SY": "aba79cc6-9aae-4fb3-8642-609f7d287853.jpg",
  "SOL101": "017c5d91-6cd4-4099-89c4-b667fdd670c7.jpg",
  "SOL101H": "634aa3c6-e4de-41ee-8efa-4799edbc20cc.jpg",
  "SOL101Y": "54bffaa1-983a-492b-b5cf-97ef8628d5fb.jpg",
  "SOL102": "90ea1043-433e-47b1-8ac7-93e24c796821.jpg",
  "SOL102Y": "8228bbcb-cff5-4913-9dfc-f1d4cf9ec6a2.jpg",
  "SOL113B": "61cf4761-a1e3-4e0a-b1c4-f97e9a11bc50.jpg",
  "SOL113BH": "8675c2a2-3a43-478a-bd88-4d39c11472ea.jpg",
  "SOL123": "680916fe-f6bd-4922-803a-ddf4d138a478.jpg",
  "SOL123H": "d5e85597-a3e8-4354-ad7d-4c298b62016d.jpg",
  "SOL123Y": "60972647-8bf7-4dff-a207-aee59c9a19a5.jpg",
  "SOL193B-2": "328da4ac-3f40-4d67-96ed-b2db299eb7ed.jpg",
  "SOL193B-5": "cbc2fb75-19b9-4e68-a31c-6c19e9b06995.jpg",
  "SOL193B-6": "ae664df2-7e5f-4292-9550-535f5d2efbbb.jpg",
  "SOL193B": "4bc4ec73-3d87-4455-abd9-dbaf624b8669.jpg",
  "SOL193BGQ-2": "c8d2d669-603b-4e3b-90bb-bbfcf30dde5a.jpg",
  "SOL193BGQ": "f31c75ef-ad38-43e3-988c-e7f01620f761.jpg",
  "SOL193BH-2": "4395984c-7f88-43eb-a186-2930d7b51851.jpg",
  "SOL193BK-302-6": "9a9c02b4-aa3c-422f-9545-09776f3b2781.jpg",
  "SOL193BY-5": "b82f6e98-a525-41a3-934d-262ae3b15f38.jpg",
  "SOL193BY": "43055bd2-cbf1-472e-b172-5319313e9e88.jpg",
  "SOL193M-2": "e5b0a37f-3a84-4888-ad06-01b8770d3572.jpg",
  "SOL193M-5": "e8355f8b-91fe-4634-97c5-767c4e91a2be.jpg",
  "SOL193M-6": "b3bdcdc9-f773-4084-9142-ffbde9751b9d.jpg",
  "SOL194-1": "771d7b5a-aa50-4dbb-98bf-6f5882c9b625.jpg",
  "SOL194-2": "eda36265-a172-427f-b57f-afe91f8a20a9.jpg",
  "SOL194": "71627cb7-de3b-4a30-bd3e-17b6c3793716.jpg",
  "SOL194GQ-2": "141fe4c2-55fa-46e6-b80a-7370000707df.jpg",
  "SOL194H": "2352a871-d68d-4122-a511-a21629d04dee.jpg",
  "SOL194Y-1": "54f8fc75-5fe9-492c-ab1b-40ed990a7c30.jpg",
  "SOL194Y": "b5850090-eca1-4de2-aff5-cfb04f424d80.jpg",
  "ETH103D": "8242b2ac-9da2-43c9-87b0-e47fa6ee3422.jpg",
  "LEO101Q": "22403cae-0644-477f-8816-83f23289fc86.jpg",
  "LEO123Q": "296671ce-82ff-4ac8-ac80-abefa8897708.jpg",
  "LEO194H": "de4fd4e2-d80d-4a0e-8fbf-5970dc3f7920.jpg",
  "XMR5050Y": "5c20faa5-cbed-4f4e-b1ad-aed769e7f02c.jpg",
  "MODEL-1": "cd1c4703-ccd2-4c1b-bb5f-c37df4fe6931.jpg",
  "MODEL-2": "949e89c8-10ab-4b8a-87f2-ef1dc69a44bc.jpg",
  "MODEL-3": "2b6de4f0-d79b-4495-a3b4-6d33fad19eb8.jpg",
  "MODEL-4": "0ea4994c-80c0-44d0-9040-cdce53b6b91e.jpg"
};

function getProductPhoto(product, baseUrl, directory, sources) {
  const key = String(product.article || '').toUpperCase();
  const source = sources[key];
  return source && String(product.photo1 || '').split(/[?#]/, 1)[0].endsWith(`/${source}`)
    ? `${baseUrl}images/products/${directory}/${key.toLowerCase()}.webp`
    : '';
}

export function getStudioProductPhoto(product, baseUrl) {
  return getProductPhoto(product, baseUrl, 'studio', studioSources);
}

export function getInteriorProductPhoto(product, baseUrl) {
  return getProductPhoto(product, baseUrl, 'interiors', interiorSources);
}
