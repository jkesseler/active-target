import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Box,
  Collapse,
  Group,
  ThemeIcon,
  UnstyledButton,
  useDirection,
} from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'
import classes from './NavLinksGroup.module.css'

interface LinksGroupProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.FC<any>
  label: string
  link?: string
  initiallyOpened?: boolean
  links?: { label: string, link: string }[]
}

export function NavLinksGroup({
  icon: Icon,
  label,
  link,
  initiallyOpened,
  links,
}: LinksGroupProps) {
  const { dir } = useDirection()

  const hasLinks = Array.isArray(links)
  const [opened, setOpened] = useState(initiallyOpened || false)
  const ChevronIcon = dir === 'ltr' ? IconChevronRight : IconChevronLeft
  const items = (hasLinks ? links : []).map((link) => {
    return (
      <Link
        to={link.link}
        key={link.label}
        className={`${classes.link}`}
        activeProps={{
          className: `${classes.link} ${classes.activeLink}`,
        }}
      >
        {link.label}
      </Link>
    )
  })

  return (
    <>
      {link
        ? (
            <Link
              to={link}
              className={classes.control}
              activeProps={{
                className: `${classes.control} ${classes.activeControl}`,
              }}
            >
              <Group gap={0} justify="space-between">
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <ThemeIcon variant="light" size={30}>
                    <Icon size="1.1rem" />
                  </ThemeIcon>
                  <Box ml="md">{label}</Box>
                </Box>
              </Group>
            </Link>
          )
        : (
            <UnstyledButton
              onClick={() => hasLinks && setOpened(isOpen => !isOpen)}
              className={classes.control}
            >
              <Group gap={0} justify="space-between">
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <ThemeIcon variant="light" size={30}>
                    <Icon size="1.1rem" />
                  </ThemeIcon>
                  <Box ml="md">{label}</Box>
                </Box>
                {hasLinks && (
                  <ChevronIcon
                    className={classes.chevron}
                    size="1rem"
                    stroke={1.5}
                    style={{
                      transform: opened
                        ? `rotate(${dir === 'rtl' ? -90 : 90}deg)`
                        : 'none',
                    }}
                  />
                )}
              </Group>
            </UnstyledButton>
          )}
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  )
}
