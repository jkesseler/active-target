import { ScrollArea } from '@mantine/core';
import { NavLinksGroup } from './NavLinksGroup';
import classes from './NavBar.module.css';
import { navLinks } from './navData';
import type { NavItem } from './types';

export function Navbar(/* { navLinks }: Props */) {
  const links = navLinks.map((item: NavItem) => (
    <NavLinksGroup key={item.label} {...item} />
  ));

  return (
    <>
      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>
    </>
  );
}
