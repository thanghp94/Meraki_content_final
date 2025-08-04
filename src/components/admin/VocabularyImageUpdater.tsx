'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface UpdateResults {
  total: number;
  processed: number;
  updated: number;
  failed: number;
  errors: string[];
}

interface VocabularyStatus {
  totalVocabulary: number;
  withImages: number;
  withoutImages: number;
  sampleData: Array<{
    id: string;
    word: string;
    imageUrl: string | null;
  }>;
}

export default function VocabularyImageUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState<UpdateResults | null>(null);
  const [status, setStatus] = useState<VocabularyStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch current vocabulary status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/vocabulary/update-images');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  // Start the image update process
  const startUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/vocabulary/update-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchSize: 10,
          delayMs: 1500, // 1.5 second delay between requests
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        // Refresh status after update
        await fetchStatus();
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  // Load status on component mount
  React.useEffect(() => {
    fetchStatus();
  }, []);

  const progressPercentage = results 
    ? Math.round((results.processed / results.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Image Updater</CardTitle>
          <CardDescription>
            Update images for vocabulary words using Google Images (child-appropriate content)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          {status && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{status.totalVocabulary}</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{status.withImages}</div>
                <div className="text-sm text-gray-600">With Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{status.withoutImages}</div>
                <div className="text-sm text-gray-600">Without Images</div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              onClick={startUpdate} 
              disabled={isUpdating}
              size="lg"
              className="w-full max-w-md"
            >
              {isUpdating ? 'Updating Images...' : 'Update All Vocabulary Images'}
            </Button>
          </div>

          {/* Progress */}
          {isUpdating && results && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {results.processed} / {results.total}</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Updated: {results.updated}</span>
                <span>Failed: {results.failed}</span>
              </div>
            </div>
          )}

          {/* Results */}
          {results && !isUpdating && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">Update Completed!</div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Badge variant="outline" className="w-full justify-center">
                        Total: {results.total}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="default" className="w-full justify-center bg-green-600">
                        Updated: {results.updated}
                      </Badge>
                    </div>
                    <div>
                      <Badge variant="destructive" className="w-full justify-center">
                        Failed: {results.failed}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Success Rate: {Math.round((results.updated / results.total) * 100)}%
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                Error: {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Sample Data */}
          {status?.sampleData && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Sample Vocabulary Words:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {status.sampleData.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{item.word}</span>
                    <Badge variant={item.imageUrl ? "default" : "secondary"}>
                      {item.imageUrl ? "Has Image" : "No Image"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Fetches all vocabulary words from the database</li>
              <li>• Searches Google Images for child-appropriate images</li>
              <li>• Updates the image_url column with the best matching image</li>
              <li>• Processes in batches with delays to respect API limits</li>
              <li>• Replaces ALL existing images (not just empty ones)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
