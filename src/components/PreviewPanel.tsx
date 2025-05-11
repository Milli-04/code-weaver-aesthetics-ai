
import React, { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PreviewPanelProps {
  generatedHtml: string;
  isLoading: boolean;
  onRefresh: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  generatedHtml, 
  isLoading,
  onRefresh
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const { toast } = useToast();

  // Update iframe content whenever HTML changes
  useEffect(() => {
    if (iframeRef.current && generatedHtml) {
      const iframe = iframeRef.current;
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(generatedHtml);
        iframeDocument.close();
      }
    }
  }, [generatedHtml]);

  const downloadHtml = () => {
    if (!generatedHtml) {
      toast({
        title: "Nothing to download",
        description: "Generate a website first before downloading.",
        variant: "destructive",
      });
      return;
    }

    const element = document.createElement('a');
    const file = new Blob([generatedHtml], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'generated-website.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Download started",
      description: "Your HTML file is being downloaded.",
    });
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-0">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2 ml-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={downloadHtml}
            disabled={!generatedHtml || isLoading}
          >
            <Download size={16} className="mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' ? (
          <div className="h-full w-full bg-white">
            {!generatedHtml && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <div className="mb-4 p-3 rounded-full bg-gray-100">
                  <RefreshCw size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No preview available</h3>
                <p className="text-sm max-w-xs">
                  Enter a prompt to generate a website and see it appear here.
                </p>
              </div>
            ) : (
              <iframe 
                ref={iframeRef}
                title="Website Preview" 
                className="w-full h-full border-none"
                sandbox="allow-scripts"
              ></iframe>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-medium">Generating your website...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-auto p-4 bg-card">
            {!generatedHtml ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <p className="text-sm">
                  No code generated yet. Start by describing a website.
                </p>
              </div>
            ) : (
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto font-mono">
                <code>{generatedHtml}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
