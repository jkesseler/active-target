import React, { useEffect } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import styles from './ActivityIndicator.module.scss';
import Portal from '@/components/Portal/Portal';

export const ActivityIndicator = ({ blockUI = true, selector = '#portal', ...restProps }) => {
  const validProps = ['animation', 'as', 'children', 'role', 'size', 'variant', 'bsPrefix'];
  const bootstrapProps = Object.assign({}, ...validProps.map(key => ({ [key]: restProps[key] })));

  useEffect(() => {
    if (blockUI) {
      document.querySelector('html')?.classList.add(styles.scrollbarFix);
      document.body.classList.add(styles.noScroll);

      return () => {
        document.querySelector('html')?.classList.remove(styles.scrollbarFix);
        document.body.classList.remove(styles.noScroll);
      };
    }
  }, [blockUI]);

  return blockUI ? (
    <Portal selector={selector}>
      <div className={styles.overlay}>
        <Spinner {...bootstrapProps} />
      </div>
    </Portal>
  ) : (
    <Spinner {...bootstrapProps} />
  );
};
