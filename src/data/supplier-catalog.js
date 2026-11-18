(function (scope) {
  'use strict';
  // Đối tác phân phối và thông tin liên hệ mẫu, không phải thông tin pháp nhân thật.
  const supplierCatalog = [
    ['S-DUTCH', 'Đại lý sữa Hà Lan', 'Dutch Lady', 'dutch lady'],
    ['S-VINA', 'Phân phối sữa Việt', 'Vinamilk', 'vinamilk'],
    ['S-TH', 'Đại lý sữa sạch', 'TH True', 'th true'],
    ['S-BETA', 'Phân phối sữa lên men', 'Betagen', 'betagen'],
    ['S-ACE', 'Đại lý mì ăn liền', 'Hảo Hảo, Đệ Nhất', 'hảo hảo|đệ nhất'],
    ['S-UNI', 'Phân phối mì 3 Miền', 'Reeva, 3 Miền', 'reeva|3 miền'],
    ['S-ORION', 'Đại lý bánh kẹo Ánh Dương', 'Orion, Ostar, Swing', 'orion|o.star|swing'],
    [
      'S-NEST',
      'Phân phối dinh dưỡng & nước khoáng',
      'Nestlé, Milo, Kitkat, La Vie',
      'nest|milo|kitkat|lavie',
    ],
    [
      'S-PEPSI',
      'Đại lý nước giải khát Xanh',
      'Pepsi, 7Up, Sting, Aquafina',
      'pepsi|7up|sting|aquafina',
    ],
    ['S-COCA', 'Phân phối nước giải khát Đỏ', 'Coca Cola, Schweppes', 'coca|schweppes'],
    ['S-CAFE', 'Đại lý cà phê Cao Nguyên', 'G7, Trung Nguyên', 'g7|trung nguyên'],
    ['S-OIL', 'Phân phối dầu & gạo Kim An', 'Simply, Neptune', 'simply|neptune'],
    ['S-TAN', 'Đại lý dầu thực vật', 'Tường An', 'tường an'],
    ['S-MASAN', 'Phân phối gia vị Bếp Việt', 'Nam Ngư, Chinsu', 'nam ngư|chinsu'],
    [
      'S-UNIHOME',
      'Phân phối hóa mỹ phẩm An Gia',
      'Knorr, Sunlight, Omo, P/S, Clear, Sunsilk, Lifebuoy',
      'knorr|sunlight|omo|p/s|clear|sunsilk|lifebuoy',
    ],
    [
      'S-PAPER',
      'Phân phối giấy & vệ sinh',
      'Pulppy, Bless You, Snowy, Huggies, Tempo',
      'pulppy|bless you|snowy|huggies|tempo',
    ],
    ['S-COOP', 'Đại lý nhãn hàng siêu thị', 'Co.op Select, Co.op Finest', 'co.op'],
    [
      'S-SNACK',
      'Phân phối bánh kẹo Minh Phát',
      'Oreo, Cream-o, Toppo, Mayora, Panda, Alpenliebe, Marshies, Phaner, Koala',
      'oreo|cream-o|toppo|mayora|panda|alpenliebe|marshies|phaner|koala',
    ],
    ['S-TEA', 'Phân phối trà & nông sản', 'Blendy, TVT, SAMADI', 'blendy|tvt|samadi'],
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = { supplierCatalog };
  else scope.Retail.supplierCatalog = supplierCatalog;
})(globalThis);
