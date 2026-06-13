-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "userId" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "referer" TEXT,
    "path" TEXT,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackEvent" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB,
    "url" TEXT,

    CONSTRAINT "TrackEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceEntry" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "fp" DOUBLE PRECISION NOT NULL,
    "fcp" DOUBLE PRECISION NOT NULL,
    "lcp" DOUBLE PRECISION NOT NULL,
    "inp" DOUBLE PRECISION NOT NULL,
    "cls" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorEntry" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "message" TEXT,
    "stack" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErrorEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_visitorId_createdAt_idx" ON "PageView"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_path_createdAt_idx" ON "PageView"("path", "createdAt");

-- CreateIndex
CREATE INDEX "TrackEvent_visitorId_createdAt_idx" ON "TrackEvent"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "TrackEvent_event_createdAt_idx" ON "TrackEvent"("event", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceEntry_fp_createdAt_idx" ON "PerformanceEntry"("fp", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceEntry_fcp_createdAt_idx" ON "PerformanceEntry"("fcp", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceEntry_lcp_createdAt_idx" ON "PerformanceEntry"("lcp", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceEntry_inp_createdAt_idx" ON "PerformanceEntry"("inp", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceEntry_cls_createdAt_idx" ON "PerformanceEntry"("cls", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceEntry_fp_fcp_lcp_inp_cls_createdAt_idx" ON "PerformanceEntry"("fp", "fcp", "lcp", "inp", "cls", "createdAt");

-- CreateIndex
CREATE INDEX "ErrorEntry_visitorId_createdAt_idx" ON "ErrorEntry"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "ErrorEntry_error_createdAt_idx" ON "ErrorEntry"("error", "createdAt");

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackEvent" ADD CONSTRAINT "TrackEvent_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceEntry" ADD CONSTRAINT "PerformanceEntry_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorEntry" ADD CONSTRAINT "ErrorEntry_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
