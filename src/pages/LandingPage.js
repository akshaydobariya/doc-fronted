import React from 'react';
import { ContentProviderReact } from 'destack';

/**
 * LandingPage Component
 *
 * Custom landing page built with Destack page builder.
 * This page can be edited visually using the Destack editor.
 */
const LandingPage = () => {
  return <ContentProviderReact showEditorInProd={false} />;
};

export default LandingPage;
