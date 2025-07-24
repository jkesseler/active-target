import {
  IconDashboard,
  IconDevicesCog,
  IconReport,
  IconUsers,
  IconFileCertificate
} from '@tabler/icons-react';
import type { NavItem } from './types';

export const navLinks: NavItem[] = [
  { 
    label: 'Dashboard', 
    icon: IconDashboard, 
    link: '/dashboard'
  },
  {
    label: 'Devices',
    icon: IconDevicesCog,
    initiallyOpened: true,
    link: '/devices'
  },
  {
    icon: IconUsers,
    label: 'Users',
    link: '/users'
  },
  {
    label: 'Stages',
    icon: IconReport,
    link: '/stages'
  }
  // {
  //   label: 'ScoreSheet',
  //   icon: IconFileCertificate,
  //   link: '/scoresheet'
  // }
];
