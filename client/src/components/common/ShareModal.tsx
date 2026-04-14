import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

/**
 * Social Sharing Modal
 */
export function ShareModal({ galleryId, galleryTitle, galleryUrl }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const shareUrl = `${window.location.origin}/p/${galleryUrl}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(galleryTitle)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(galleryTitle)}&body=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Gallery</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium mb-2">Gallery Link</label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-xs" />
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium mb-3">Share On</label>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded border hover:bg-gray-50 transition"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </a>
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded border hover:bg-gray-50 transition"
              >
                <Twitter className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Twitter</span>
              </a>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded border hover:bg-gray-50 transition"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                <span className="text-sm">LinkedIn</span>
              </a>
              <a
                href={socialLinks.email}
                className="flex items-center gap-2 px-4 py-2 rounded border hover:bg-gray-50 transition"
              >
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Email</span>
              </a>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <label className="block text-sm font-medium mb-2">Embed Code</label>
            <textarea
              value={embedCode}
              readOnly
              className="w-full px-3 py-2 border rounded font-mono text-xs h-20 bg-gray-50"
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={handleCopyEmbed}
            >
              {copied ? 'Copied!' : 'Copy Embed Code'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
