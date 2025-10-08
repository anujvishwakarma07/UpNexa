'use client';

import React, { useEffect, useState } from 'react';
import Ping from './Ping';

interface ViewProps {
  id: string;
  initialViews: number; // pass the current view count from the server
}

const View = ({ id, initialViews }: ViewProps) => {
  const [views, setViews] = useState<number>(initialViews);

  useEffect(() => {
    const incrementViews = async () => {
      try {
        const res = await fetch(`/api/views/${id}`, { method: 'POST' });
        const data = await res.json();
        setViews(data.views);
      } catch (err) {
        console.error('Error incrementing views:', err);
      }
    };

    incrementViews();
  }, [id]);

  return (
    <div className="view-container relative">
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>

      <p className="view-text px-2 py-1 rounded-md bg-[rgb(160,191,191)]">
        <span className="font-black">Views: {views}</span>
      </p>
    </div>
  );
};

export default View;
