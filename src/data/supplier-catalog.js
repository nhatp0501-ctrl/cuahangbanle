(function (scope) {
  'use strict';
  // Đối tác phân phối và thông tin liên hệ mẫu, không phải thông tin pháp nhân thật.
  const supplierCatalog = [
    ['S-DUTCH', 'Đại lý Dutch Lady', 'Dutch Lady', 'dutch lady'],
    ['S-VINA', 'Đại lý Vinamilk', 'Vinamilk', 'vinamilk'],
    ['S-TH', 'Đại lý TH True', 'TH True', 'th true'],
    ['S-BETA', 'Đại lý Betagen', 'Betagen', 'betagen'],
    ['S-ACE', 'Đại lý Acecook — Hảo Hảo, Đệ Nhất', 'Hảo Hảo, Đệ Nhất', 'hảo hảo|đệ nhất'],
    ['S-UNI', 'Đại lý Reeva, 3 Miền', 'Reeva, 3 Miền', 'reeva|3 miền'],
    ['S-ORION', 'Đại lý Orion — Ostar, Swing', 'Orion, Ostar, Swing', 'orion|o.star|swing'],
    [
      'S-NEST',
      'Đại lý Nestlé, Milo, Kitkat, La Vie',
      'Nestlé, Milo, Kitkat, La Vie',
      'nest|milo|kitkat|lavie',
    ],
    [
      'S-PEPSI',
      'Đại lý Pepsi, 7Up, Sting, Aquafina',
      'Pepsi, 7Up, Sting, Aquafina',
      'pepsi|7up|sting|aquafina',
    ],
    ['S-COCA', 'Đại lý Coca Cola, Schweppes', 'Coca Cola, Schweppes', 'coca|schweppes'],
    ['S-CAFE', 'Đại lý Trung Nguyên — G7', 'G7, Trung Nguyên', 'g7|trung nguyên'],
    ['S-OIL', 'Đại lý Simply, Neptune', 'Simply, Neptune', 'simply|neptune'],
    ['S-TAN', 'Đại lý Tường An', 'Tường An', 'tường an'],
    ['S-MASAN', 'Đại lý Nam Ngư, Chinsu', 'Nam Ngư, Chinsu', 'nam ngư|chinsu'],
    [
      'S-UNIHOME',
      'Đại lý Knorr, Sunlight, Omo, P/S, Clear, Sunsilk, Lifebuoy',
      'Knorr, Sunlight, Omo, P/S, Clear, Sunsilk, Lifebuoy',
      'knorr|sunlight|omo|p/s|clear|sunsilk|lifebuoy',
    ],
    [
      'S-PAPER',
      'Đại lý Pulppy, Bless You, Snowy, Huggies, Tempo',
      'Pulppy, Bless You, Snowy, Huggies, Tempo',
      'pulppy|bless you|snowy|huggies|tempo',
    ],
    ['S-COOP', 'Đại lý Co.op Select, Co.op Finest', 'Co.op Select, Co.op Finest', 'co.op'],
    [
      'S-SNACK',
      'Đại lý bánh kẹo Oreo, Cream-o, Toppo & các nhãn phân phối',
      'Oreo, Cream-o, Toppo, Mayora, Panda, Alpenliebe, Marshies, Phaner, Koala',
      'oreo|cream-o|toppo|mayora|panda|alpenliebe|marshies|phaner|koala',
    ],
    ['S-TEA', 'Đại lý Blendy, TVT, gạo SAMADI', 'Blendy, TVT, SAMADI', 'blendy|tvt|samadi'],
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = { supplierCatalog };
  else scope.Retail.supplierCatalog = supplierCatalog;
})(globalThis);
