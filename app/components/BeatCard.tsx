"use client"; // Ensure that this file is client-side

import React from 'react';

type BeatCardProps = {
  beat: {
    id: string;
    title: string;
    artist: string;
    genre: string;
    coverUrl: string;
    price: number;
    stock: number;
  };
};

const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <img 
        src={beat.coverUrl}
        alt={`${beat.title} cover`}
        className="w-full h-48 object-cover rounded mb-4"
      />
      <h3 className="text-xl font-semibold mb-2">{beat.title}</h3>
      <p className="text-gray-500 mb-2">{beat.artist}</p>
      <p className="text-gray-400 mb-2">{beat.genre}</p>
      <p className="text-gray-600 font-bold">£{beat.price}</p>
      <p className="text-gray-500">Stock: {beat.stock}</p>
    </div>
  );
};

export default BeatCard;
