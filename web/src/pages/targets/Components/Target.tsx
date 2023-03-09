import React from 'react';
import objstr from 'obj-str';
import { Crosshair, Target as TargetIcon, CheckCircle, XCircle } from 'react-feather';
import styles from './Target.module.css';

export const Target = ({ targetResult }: {targetResult: TargetResult }) => {
  const className = objstr({
    [styles.target]: true,
    [styles.hit]: targetResult === 'hit',
    [styles.missed]: targetResult === 'missed'
  });

  return (
    <div className={styles.targetContain}>
      <Crosshair size="100%" color="currentColor" className={className} />
      {targetResult === null && <TargetIcon size="100%" color="currentColor" className={styles.targetLayer} />}
      {targetResult === 'hit' && <CheckCircle size="100%" color="currentColor" className={`${styles.targetLayer} ${styles.hit}`} />}
      {targetResult === 'missed' && <XCircle size="100%" color="currentColor" className={`${styles.targetLayer} ${styles.missed}`} />}
    </div>
  );
};
