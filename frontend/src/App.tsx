import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormProvider } from './contexts/FormContext';
import Layout from './components/Layout';
import FormBuilder from './pages/FormBuilder';
import FormPreview from './pages/FormPreview';
import FormList from './pages/FormList';
import FormSubmissions from './pages/FormSubmissions';

function App() {
  return (
    <FormProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<FormList />} />
          <Route path="/builder/:id?" element={<FormBuilder />} />
          <Route path="/preview/:id" element={<FormPreview />} />
          <Route path="/submissions/:id" element={<FormSubmissions />} />
        </Routes>
      </Layout>
    </FormProvider>
  );
}

export default App;