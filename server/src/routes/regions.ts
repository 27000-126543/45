import { Router, Response } from 'express';
import { provinces, getRegionByCode, getAllCities } from '../data/regions.js';
import { authenticate, canAccessRegion, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

interface RegionTreeNode {
  code: string;
  name: string;
  type: 'province' | 'city' | 'district';
  children?: RegionTreeNode[];
}

router.get('/', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const tree: RegionTreeNode[] = [];

  for (const province of provinces) {
    if (!canAccessRegion(req.user, province.code)) {
      continue;
    }

    const provinceNode: RegionTreeNode = {
      code: province.code,
      name: province.name,
      type: 'province',
      children: [],
    };

    for (const city of province.cities) {
      if (!canAccessRegion(req.user, city.code)) {
        continue;
      }

      const cityNode: RegionTreeNode = {
        code: city.code,
        name: city.name,
        type: 'city',
        children: [],
      };

      for (const district of city.districts) {
        if (!canAccessRegion(req.user, district.code)) {
          continue;
        }

        cityNode.children!.push({
          code: district.code,
          name: district.name,
          type: 'district',
        });
      }

      provinceNode.children!.push(cityNode);
    }

    tree.push(provinceNode);
  }

  res.json({ success: true, data: tree });
});

router.get('/:code', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { code } = req.params;

  if (!canAccessRegion(req.user, code)) {
    res.status(403).json({ success: false, error: '无权限访问该区域' });
    return;
  }

  const region = getRegionByCode(code);

  if (!region) {
    res.status(404).json({ success: false, error: '区域不存在' });
    return;
  }

  let children: RegionTreeNode[] = [];

  if (region.type === 'province') {
    const province = provinces.find(p => p.code === code);
    if (province) {
      children = province.cities
        .filter(c => canAccessRegion(req.user!, c.code))
        .map(city => ({
          code: city.code,
          name: city.name,
          type: 'city' as const,
          children: city.districts
            .filter(d => canAccessRegion(req.user!, d.code))
            .map(d => ({
              code: d.code,
              name: d.name,
              type: 'district' as const,
            })),
        }));
    }
  } else if (region.type === 'city') {
    const cities = getAllCities();
    const city = cities.find(c => c.code === code);
    if (city) {
      children = city.districts
        .filter(d => canAccessRegion(req.user!, d.code))
        .map(d => ({
          code: d.code,
          name: d.name,
          type: 'district' as const,
        }));
    }
  }

  res.json({
    success: true,
    data: {
      ...region,
      children,
    },
  });
});

export default router;
