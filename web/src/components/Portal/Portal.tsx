import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface IPortalProps {
  children?: React.ReactNode;
  selector: string;
}


const Portal = ({ children, selector = '#portal' }: IPortalProps) => {
  const nodeRef: any = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    nodeRef.current = document.querySelector(selector);
    !!nodeRef.current && setMounted(true);

    return () => setMounted(false);
  }, [selector]);

  return mounted ? createPortal(children, nodeRef.current) : null;
};

export default Portal;
