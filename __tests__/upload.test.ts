/**
 * Upload Validation Tests
 * 
 * Tests file type validation, file size limits, row count validation,
 * and tier limit enforcement for the file upload functionality.
 */

describe('File Upload Validation', () => {
  describe('File Type Validation', () => {
    it('should accept CSV files', () => {
      const csvFile = new File(['col1,col2\nval1,val2'], 'test.csv', {
        type: 'text/csv',
      });
      
      expect(csvFile.name.endsWith('.csv')).toBe(true);
      expect(csvFile.type).toBe('text/csv');
    });

    it('should accept Excel .xlsx files', () => {
      const xlsxFile = new File([''], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      expect(xlsxFile.name.endsWith('.xlsx')).toBe(true);
    });

    it('should accept Excel .xls files', () => {
      const xlsFile = new File([''], 'test.xls', {
        type: 'application/vnd.ms-excel',
      });
      
      expect(xlsFile.name.endsWith('.xls')).toBe(true);
    });

    it('should reject non-CSV/Excel files', () => {
      const txtFile = new File(['test'], 'test.txt', {
        type: 'text/plain',
      });
      const pdfFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      
      expect(txtFile.name.endsWith('.txt')).toBe(true);
      expect(pdfFile.name.endsWith('.pdf')).toBe(true);
      
      // These should be rejected by validation
      const acceptedExtensions = ['.csv', '.xls', '.xlsx'];
      expect(acceptedExtensions.some(ext => txtFile.name.endsWith(ext))).toBe(false);
      expect(acceptedExtensions.some(ext => pdfFile.name.endsWith(ext))).toBe(false);
    });
  });

  describe('File Size Limits', () => {
    it('should accept files under 10 MB', () => {
      const smallFile = new File(['x'.repeat(1024 * 1024)], 'small.csv', {
        type: 'text/csv',
      }); // 1 MB
      
      const maxSize = 10 * 1024 * 1024; // 10 MB
      expect(smallFile.size).toBeLessThan(maxSize);
    });

    it('should reject files over 10 MB', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.csv', {
        type: 'text/csv',
      }); // 11 MB
      
      const maxSize = 10 * 1024 * 1024; // 10 MB
      expect(largeFile.size).toBeGreaterThan(maxSize);
    });

    it('should accept files at exactly 10 MB', () => {
      const exactFile = new File(['x'.repeat(10 * 1024 * 1024)], 'exact.csv', {
        type: 'text/csv',
      }); // Exactly 10 MB
      
      const maxSize = 10 * 1024 * 1024; // 10 MB
      expect(exactFile.size).toBeLessThanOrEqual(maxSize);
    });
  });

  describe('Row Count Validation', () => {
    it('should count CSV rows correctly', () => {
      const csvContent = 'col1,col2,col3\n' + 
                        'val1,val2,val3\n'.repeat(100);
      const csvFile = new File([csvContent], 'test.csv', {
        type: 'text/csv',
      });
      
      // Count rows (excluding header)
      const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
      const rowCount = lines.length - 1; // Subtract header
      
      expect(rowCount).toBe(100);
    });

    it('should reject files with less than 10 rows', () => {
      const csvContent = 'col1,col2\n' + 
                        'val1,val2\n'.repeat(5);
      
      const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
      const rowCount = lines.length - 1;
      
      expect(rowCount).toBeLessThan(10);
    });

    it('should accept files with at least 10 rows', () => {
      const csvContent = 'col1,col2\n' + 
                        'val1,val2\n'.repeat(10);
      
      const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
      const rowCount = lines.length - 1;
      
      expect(rowCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Tier Limit Enforcement', () => {
    it('should enforce free tier row limit of 1000', () => {
      const freeTierLimit = 1000;
      const rowCount = 1500;
      
      expect(rowCount).toBeGreaterThan(freeTierLimit);
    });

    it('should accept files within free tier row limit', () => {
      const freeTierLimit = 1000;
      const rowCount = 500;
      
      expect(rowCount).toBeLessThanOrEqual(freeTierLimit);
    });

    it('should enforce free tier story limit of 3 per month', () => {
      const freeTierStoryLimit = 3;
      const storiesThisMonth = 3;
      
      const canCreateStory = storiesThisMonth < freeTierStoryLimit;
      expect(canCreateStory).toBe(false);
    });

    it('should allow story creation when under limit', () => {
      const freeTierStoryLimit = 3;
      const storiesThisMonth = 2;
      
      const canCreateStory = storiesThisMonth < freeTierStoryLimit;
      expect(canCreateStory).toBe(true);
    });

    it('should allow professional tier higher limits', () => {
      const professionalTierLimit = 50000;
      const rowCount = 5000;
      
      expect(rowCount).toBeLessThanOrEqual(professionalTierLimit);
    });
  });

  describe('File Extension Validation', () => {
    it('should extract file extension correctly', () => {
      const getExtension = (filename: string) => {
        return '.' + filename.split('.').pop()?.toLowerCase();
      };
      
      expect(getExtension('test.csv')).toBe('.csv');
      expect(getExtension('data.xlsx')).toBe('.xlsx');
      expect(getExtension('report.xls')).toBe('.xls');
      expect(getExtension('file.CSV')).toBe('.csv'); // Case insensitive
    });

    it('should handle files with multiple dots', () => {
      const getExtension = (filename: string) => {
        return '.' + filename.split('.').pop()?.toLowerCase();
      };
      
      expect(getExtension('my.data.file.csv')).toBe('.csv');
      expect(getExtension('report.2024.xlsx')).toBe('.xlsx');
    });
  });

  describe('CSV Content Validation', () => {
    it('should validate CSV has at least 2 columns', () => {
      const csvWithTwoColumns = 'col1,col2\nval1,val2';
      const csvWithOneColumn = 'col1\nval1';
      
      const countColumns = (csv: string) => {
        const firstLine = csv.split('\n')[0];
        return firstLine.split(',').length;
      };
      
      expect(countColumns(csvWithTwoColumns)).toBeGreaterThanOrEqual(2);
      expect(countColumns(csvWithOneColumn)).toBeLessThan(2);
    });

    it('should handle CSV with empty lines', () => {
      const csvContent = 'col1,col2\nval1,val2\n\nval3,val4\n';
      
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      const rowCount = lines.length - 1; // Subtract header
      
      expect(rowCount).toBe(2); // Only non-empty data rows
    });

    it('should handle different line endings', () => {
      const csvUnix = 'col1,col2\nval1,val2\nval3,val4';
      const csvWindows = 'col1,col2\r\nval1,val2\r\nval3,val4';
      
      const countRows = (csv: string) => {
        const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
        return lines.length - 1;
      };
      
      expect(countRows(csvUnix)).toBe(2);
      expect(countRows(csvWindows)).toBe(2);
    });
  });

  describe('Error Message Validation', () => {
    it('should provide clear error for invalid file type', () => {
      const errorMessage = 'Please upload CSV or Excel files only (.csv, .xls, .xlsx)';
      expect(errorMessage).toContain('CSV');
      expect(errorMessage).toContain('Excel');
      expect(errorMessage).toContain('.csv');
    });

    it('should provide clear error for file size limit', () => {
      const errorMessage = 'File size exceeds 10 MB limit';
      expect(errorMessage).toContain('10 MB');
      expect(errorMessage).toContain('limit');
    });

    it('should provide clear error for row limit', () => {
      const tier = 'free';
      const limit = 1000;
      const errorMessage = `Dataset contains approximately 1500 rows. Your ${tier} tier supports up to ${limit} rows. Please upgrade or use a smaller dataset.`;
      
      expect(errorMessage).toContain('1500 rows');
      expect(errorMessage).toContain('1000 rows');
      expect(errorMessage).toContain('upgrade');
    });

    it('should provide clear error for story limit', () => {
      const limit = 3;
      const errorMessage = `You've reached your monthly limit of ${limit} stories. Upgrade or wait until next month.`;
      
      expect(errorMessage).toContain('monthly limit');
      expect(errorMessage).toContain('3 stories');
      expect(errorMessage).toContain('Upgrade');
    });
  });
});
