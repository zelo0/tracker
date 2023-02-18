import { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string
}

/* 가격 새로 등록 시
* 통계랑 첫 페이지 revalidate - regenerate
*/
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') { 
    return res.status(405).json({ message: 'Only post method allowed'});
   }

   const body = req.body;

  if (body.secret !== process.env.NEXT_PUBLIC_MY_SECRET_TOKEN) {
    return res.status(404).json({ message: 'Invalid secret'});
  }

  if (!body.goodId) {
    return res.status(400).json({ message: 'pass a goodId using query'});
  }

  try {
    await res.revalidate('/');
    await res.revalidate(`/products/${body.goodId}`);
    return res.status(200).json({ message: 'success to revalidate' });
  } catch (err) {
    return res.status(500).json({ message: 'error while revalidating' }); 
  }
}