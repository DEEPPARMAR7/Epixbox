import React, { useState } from 'react';
import { Share2, Facebook, Linkedin, Twitter, Copy, Mail, QrCode, Code } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';
import toast from 'react-hot-toast';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export default function SocialShare({
  url,
  title,
  description = '',
  imageUrl = '',
}: SocialShareProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const generateEmbedCode = () => {
    return `<iframe src="${url}?embed=true" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2"
      >
        <Share2 size={16} />
        Share
      </Button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Share Gallery">
        <div className="space-y-6">
          {/* Direct Link */}
          <div>
            <h3 className="font-semibold mb-2">Direct Link</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={copyToClipboard}
              >
                {copied ? '✓ Copied' : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-3">Share on Social Media</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={shareOnFacebook}
                className="flex items-center gap-2"
              >
                <Facebook size={18} className="text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="secondary"
                onClick={shareOnTwitter}
                className="flex items-center gap-2"
              >
                <Twitter size={18} className="text-blue-400" />
                Twitter
              </Button>
              <Button
                variant="secondary"
                onClick={shareOnLinkedIn}
                className="flex items-center gap-2"
              >
                <Linkedin size={18} className="text-blue-700" />
                LinkedIn
              </Button>
              <Button
                variant="secondary"
                onClick={shareViaEmail}
                className="flex items-center gap-2"
              >
                <Mail size={18} className="text-gray-600" />
                Email
              </Button>
            </div>
          </div>

          {/* Embedding */}
          <div>
            <h3 className="font-semibold mb-2">Embed Gallery</h3>
            <p className="text-sm text-gray-600 mb-2">
              Copy this code to embed the gallery on your website:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
              {generateEmbedCode()}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(generateEmbedCode());
                toast.success('Embed code copied');
              }}
              className="mt-2 w-full"
            >
              Copy Embed Code
            </Button>
          </div>

          {/* QR Code */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <QrCode size={18} />
              QR Code
            </h3>
            <p className="text-sm text-gray-600">
              Scan to open gallery on mobile devices
            </p>
            {/* QR code would be generated here using a library like qrcode.react */}
            <div className="mt-3 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-sm text-gray-500">QR Code will appear here</p>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Make sure your gallery visibility is set correctly before sharing
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

// Gallery Embed Component for websites
export function GalleryEmbed({
  galleryId,
  layout = 'grid',
  height = 600,
}: {
  galleryId: string | number;
  layout?: string;
  height?: number;
}) {
  const embedUrl = `${window.location.origin}/embed/gallery/${galleryId}?layout=${layout}`;

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height={height}
      frameBorder="0"
      allowFullScreen
      title={`Gallery ${galleryId}`}
    />
  );
}

// Social Share Buttons for portfolio pages
export function PortfolioShareButtons({
  username,
  portfolioUrl,
}: {
  username: string;
  portfolioUrl: string;
}) {
  const title = `Check out my photography portfolio`;
  const description = `Portfolio by ${username}`;

  return (
    <div className="flex items-center gap-3">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        title="Share on Facebook"
      >
        <Facebook size={20} className="text-blue-600" />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(portfolioUrl)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        title="Share on Twitter"
      >
        <Twitter size={20} className="text-blue-400" />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full hover:bg-gray-100 transition"
        title="Share on LinkedIn"
      >
        <Linkedin size={20} className="text-blue-700" />
      </a>

      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + portfolioUrl)}`}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        title="Share via Email"
      >
        <Mail size={20} className="text-gray-600" />
      </a>
    </div>
  );
}
