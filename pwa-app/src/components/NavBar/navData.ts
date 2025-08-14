import {
  IconDashboard,
  IconDevicesCog,
  IconReport,
  IconUsers,
  IconDeviceTv
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
    link: '/manage/devices'
  },
  {
    icon: IconUsers,
    label: 'Users',
    link: '/manage/users'
  },
  {
    label: 'Stages',
    icon: IconReport,
    link: '/manage/stages'
  },
  {
    label: 'Big Screen',
    icon: IconDeviceTv,
    link: '/big-screen'
  }
  // {
  //   label: 'ScoreSheet',
  //   icon: IconFileCertificate,
  //   link: '/scoresheet'
  // }
];
