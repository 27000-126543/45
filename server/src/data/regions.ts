import type { Region } from '../types/index.js';

export interface ProvinceData {
  code: string;
  name: string;
  cities: CityData[];
}

export interface CityData {
  code: string;
  name: string;
  provinceCode: string;
  districts: DistrictData[];
}

export interface DistrictData {
  code: string;
  name: string;
  cityCode: string;
}

export const provinces: ProvinceData[] = [
  {
    code: '110000',
    name: '北京市',
    cities: [
      {
        code: '110100',
        name: '北京市',
        provinceCode: '110000',
        districts: [
          { code: '110101', name: '东城区', cityCode: '110100' },
          { code: '110102', name: '西城区', cityCode: '110100' },
          { code: '110105', name: '朝阳区', cityCode: '110100' },
          { code: '110108', name: '海淀区', cityCode: '110100' },
        ],
      },
    ],
  },
  {
    code: '310000',
    name: '上海市',
    cities: [
      {
        code: '310100',
        name: '上海市',
        provinceCode: '310000',
        districts: [
          { code: '310101', name: '黄浦区', cityCode: '310100' },
          { code: '310104', name: '徐汇区', cityCode: '310100' },
          { code: '310105', name: '长宁区', cityCode: '310100' },
          { code: '310106', name: '静安区', cityCode: '310100' },
        ],
      },
    ],
  },
  {
    code: '440000',
    name: '广东省',
    cities: [
      {
        code: '440100',
        name: '广州市',
        provinceCode: '440000',
        districts: [
          { code: '440103', name: '荔湾区', cityCode: '440100' },
          { code: '440104', name: '越秀区', cityCode: '440100' },
          { code: '440105', name: '海珠区', cityCode: '440100' },
          { code: '440106', name: '天河区', cityCode: '440100' },
        ],
      },
      {
        code: '440300',
        name: '深圳市',
        provinceCode: '440000',
        districts: [
          { code: '440303', name: '罗湖区', cityCode: '440300' },
          { code: '440304', name: '福田区', cityCode: '440300' },
          { code: '440305', name: '南山区', cityCode: '440300' },
          { code: '440306', name: '宝安区', cityCode: '440300' },
        ],
      },
      {
        code: '440600',
        name: '佛山市',
        provinceCode: '440000',
        districts: [
          { code: '440604', name: '禅城区', cityCode: '440600' },
          { code: '440605', name: '南海区', cityCode: '440600' },
          { code: '440606', name: '顺德区', cityCode: '440600' },
          { code: '440607', name: '三水区', cityCode: '440600' },
        ],
      },
    ],
  },
  {
    code: '320000',
    name: '江苏省',
    cities: [
      {
        code: '320100',
        name: '南京市',
        provinceCode: '320000',
        districts: [
          { code: '320102', name: '玄武区', cityCode: '320100' },
          { code: '320104', name: '秦淮区', cityCode: '320100' },
          { code: '320105', name: '建邺区', cityCode: '320100' },
          { code: '320106', name: '鼓楼区', cityCode: '320100' },
        ],
      },
      {
        code: '320500',
        name: '苏州市',
        provinceCode: '320000',
        districts: [
          { code: '320505', name: '虎丘区', cityCode: '320500' },
          { code: '320506', name: '吴中区', cityCode: '320500' },
          { code: '320507', name: '相城区', cityCode: '320500' },
          { code: '320508', name: '姑苏区', cityCode: '320500' },
        ],
      },
      {
        code: '320200',
        name: '无锡市',
        provinceCode: '320000',
        districts: [
          { code: '320205', name: '锡山区', cityCode: '320200' },
          { code: '320206', name: '惠山区', cityCode: '320200' },
          { code: '320211', name: '滨湖区', cityCode: '320200' },
          { code: '320213', name: '梁溪区', cityCode: '320200' },
        ],
      },
    ],
  },
  {
    code: '330000',
    name: '浙江省',
    cities: [
      {
        code: '330100',
        name: '杭州市',
        provinceCode: '330000',
        districts: [
          { code: '330102', name: '上城区', cityCode: '330100' },
          { code: '330105', name: '拱墅区', cityCode: '330100' },
          { code: '330106', name: '西湖区', cityCode: '330100' },
          { code: '330108', name: '滨江区', cityCode: '330100' },
        ],
      },
      {
        code: '330200',
        name: '宁波市',
        provinceCode: '330000',
        districts: [
          { code: '330203', name: '海曙区', cityCode: '330200' },
          { code: '330205', name: '江北区', cityCode: '330200' },
          { code: '330206', name: '北仑区', cityCode: '330200' },
          { code: '330211', name: '镇海区', cityCode: '330200' },
        ],
      },
      {
        code: '330300',
        name: '温州市',
        provinceCode: '330000',
        districts: [
          { code: '330302', name: '鹿城区', cityCode: '330300' },
          { code: '330303', name: '龙湾区', cityCode: '330300' },
          { code: '330304', name: '瓯海区', cityCode: '330300' },
          { code: '330305', name: '洞头区', cityCode: '330300' },
        ],
      },
    ],
  },
  {
    code: '510000',
    name: '四川省',
    cities: [
      {
        code: '510100',
        name: '成都市',
        provinceCode: '510000',
        districts: [
          { code: '510104', name: '锦江区', cityCode: '510100' },
          { code: '510105', name: '青羊区', cityCode: '510100' },
          { code: '510106', name: '金牛区', cityCode: '510100' },
          { code: '510107', name: '武侯区', cityCode: '510100' },
        ],
      },
      {
        code: '510300',
        name: '自贡市',
        provinceCode: '510000',
        districts: [
          { code: '510302', name: '自流井区', cityCode: '510300' },
          { code: '510303', name: '贡井区', cityCode: '510300' },
          { code: '510304', name: '大安区', cityCode: '510300' },
          { code: '510311', name: '沿滩区', cityCode: '510300' },
        ],
      },
      {
        code: '510400',
        name: '攀枝花市',
        provinceCode: '510000',
        districts: [
          { code: '510402', name: '东区', cityCode: '510400' },
          { code: '510403', name: '西区', cityCode: '510400' },
          { code: '510411', name: '仁和区', cityCode: '510400' },
          { code: '510421', name: '米易县', cityCode: '510400' },
        ],
      },
    ],
  },
  {
    code: '420000',
    name: '湖北省',
    cities: [
      {
        code: '420100',
        name: '武汉市',
        provinceCode: '420000',
        districts: [
          { code: '420102', name: '江岸区', cityCode: '420100' },
          { code: '420103', name: '江汉区', cityCode: '420100' },
          { code: '420104', name: '硚口区', cityCode: '420100' },
          { code: '420105', name: '汉阳区', cityCode: '420100' },
        ],
      },
      {
        code: '420200',
        name: '黄石市',
        provinceCode: '420000',
        districts: [
          { code: '420202', name: '黄石港区', cityCode: '420200' },
          { code: '420203', name: '西塞山区', cityCode: '420200' },
          { code: '420204', name: '下陆区', cityCode: '420200' },
          { code: '420205', name: '铁山区', cityCode: '420200' },
        ],
      },
      {
        code: '420300',
        name: '十堰市',
        provinceCode: '420000',
        districts: [
          { code: '420302', name: '茅箭区', cityCode: '420300' },
          { code: '420303', name: '张湾区', cityCode: '420300' },
          { code: '420304', name: '郧阳区', cityCode: '420300' },
          { code: '420322', name: '郧西县', cityCode: '420300' },
        ],
      },
    ],
  },
  {
    code: '370000',
    name: '山东省',
    cities: [
      {
        code: '370100',
        name: '济南市',
        provinceCode: '370000',
        districts: [
          { code: '370102', name: '历下区', cityCode: '370100' },
          { code: '370103', name: '市中区', cityCode: '370100' },
          { code: '370104', name: '槐荫区', cityCode: '370100' },
          { code: '370105', name: '天桥区', cityCode: '370100' },
        ],
      },
      {
        code: '370200',
        name: '青岛市',
        provinceCode: '370000',
        districts: [
          { code: '370202', name: '市南区', cityCode: '370200' },
          { code: '370203', name: '市北区', cityCode: '370200' },
          { code: '370211', name: '黄岛区', cityCode: '370200' },
          { code: '370212', name: '崂山区', cityCode: '370200' },
        ],
      },
      {
        code: '370300',
        name: '淄博市',
        provinceCode: '370000',
        districts: [
          { code: '370302', name: '淄川区', cityCode: '370300' },
          { code: '370303', name: '张店区', cityCode: '370300' },
          { code: '370304', name: '博山区', cityCode: '370300' },
          { code: '370305', name: '临淄区', cityCode: '370300' },
        ],
      },
    ],
  },
];

export function getAllDistricts(): DistrictData[] {
  const districts: DistrictData[] = [];
  for (const province of provinces) {
    for (const city of province.cities) {
      districts.push(...city.districts);
    }
  }
  return districts;
}

export function getAllCities(): CityData[] {
  const cities: CityData[] = [];
  for (const province of provinces) {
    cities.push(...province.cities);
  }
  return cities;
}

export function getRegionByCode(code: string): Region | null {
  for (const province of provinces) {
    if (province.code === code) {
      return { code: province.code, name: province.name, type: 'province' };
    }
    for (const city of province.cities) {
      if (city.code === code) {
        return { code: city.code, name: city.name, type: 'city', parentCode: province.code };
      }
      for (const district of city.districts) {
        if (district.code === code) {
          return { code: district.code, name: district.name, type: 'district', parentCode: city.code };
        }
      }
    }
  }
  return null;
}

export function getRegionName(code: string): string {
  const region = getRegionByCode(code);
  return region?.name ?? code;
}
