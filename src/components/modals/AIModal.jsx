import React from 'react';
import { AIConsultant } from '../AIConsultant';

/**
 * AIModal is now evolved into the persistent floating AIConsultant.
 * Exported for seamless backward compatibility.
 */
export const AIModal = () => {
  return <AIConsultant />;
};

export default AIModal;
