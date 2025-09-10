import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  async shareFile(username: string, fileId: string, sensitivity: string) {
    const response = await fetch('http://localhost:5000/api/share', {
      method: 'POST',
      credentials: 'include', // 🔑 sends JWT cookie
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: username,
        fileId: fileId,
        sensitivity: sensitivity,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to share file');
    }

    return response.json();
  }
}
