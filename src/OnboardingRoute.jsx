import React from 'react';
import { Navigate } from 'react-router-dom';

const OnboardingRoute = ({ children, step }) => {
  const token = localStorage.getItem('token');
  const onboarding1Completed = localStorage.getItem('onboarding1Completed') === 'true';
  const onboarding2Completed = localStorage.getItem('onboarding2Completed') === 'true';

  if (!token) {
    return <Navigate to="/Login" />;
  }

  if (step === 1 && onboarding1Completed) {
    return <Navigate to="/Onboarding2" />;
  }

  if (step === 2 && onboarding2Completed) {
    return <Navigate to="/Overview" />;
  }

  return children;
};

export default OnboardingRoute;
