import React from 'react';

function ImageUploader({ image, onChange }) {
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="card">
      <div className="card-title">와이파이 안내문 사진 업로드</div>
      <label className="upload">
        <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFile(e.target.files[0])} />
        <span>사진 찍기 / 선택</span>
      </label>
      {image && <img src={image} alt="preview" className="preview" />}
    </div>
  );
}

export default ImageUploader;
