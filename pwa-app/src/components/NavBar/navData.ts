import {
  IconDashboard,
  IconReport,
  IconDeviceTv,
} from '@tabler/icons-react';
import type { NavItem } from './types';

export const navLinks: NavItem[] = [
  {
    label: 'Dashboard',
    icon: IconDashboard,
    link: '/dashboard',
  },
  {
    label: 'Manage',
    icon: IconReport,
    links: [
      {
        label: 'Devices',
        link: '/manage/devices',
      },
      {
        label: 'Users',
        link: '/manage/users',
      },
      {
        label: 'Stages',
        link: '/manage/stages',
      },
    ],
  },
  {
    label: 'Big Screen',
    icon: IconDeviceTv,
    link: '/big-screen',
  },
  // {
  //   label: 'ScoreSheet',
  //   icon: IconFileCertificate,
  //   link: '/scoresheet'
  // }
];
