import React from 'react';
import styles from './styles.module.css';

export default function HexSpan({ data }: { data: Uint8Array }) {
  return (
    <span>
      {[...data].map((d, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <span className={styles.hexCell} key={idx}>
          {d.toString(16).padStart(2, '0')}
        </span>
      ))}
    </span>
  );
}
