// iROUP Auto Image URL Helper
function iroupImageUrl(url){
  url = String(url || '').trim();
  if(!url) return '';
  let m = url.match(/\/file\/d\/([^/]+)/);
  if(m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = url.match(/[?&]id=([^&]+)/);
  if(url.includes('drive.google.com') && m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return url;
}
function iroupPickImage(row){
  if(!row) return '';
  const keys = [
    'Poster_URL','Poster URL','poster_url','poster','Poster',
    'Poster_Clean','Poster Clean',
    'Banner_URL','Banner URL','banner_url','banner','Banner',
    'รูปปก_URL','รูปปก URL','รูปปก',
    'รูปภาพ_URL','รูปภาพ','ไฟล์รูป','ไฟล์รูป_URL',
    'Image_URL','Image URL','image_url','image','Image',
    'แบนเนอร์','แบนเนอร์_URL'
  ];
  for(const k of keys){
    const v = row[k];
    if(v !== undefined && v !== null && String(v).trim() !== ''){
      return iroupImageUrl(v);
    }
  }
  return '';
}
