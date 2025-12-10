import React from 'react';

const Loading = () => {
	return (
		<div className="loading-container">
		<div className="spinner"></div>
		<p style={{ fontSize: '0.9rem', color: '#64748b' }}>Carregando...</p>
		</div>
	);
};

export default Loading;