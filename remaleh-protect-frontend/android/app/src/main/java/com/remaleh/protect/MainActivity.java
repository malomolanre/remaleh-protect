package com.remalehprotect.app;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleShare(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShare(intent);
    }

    private void handleShare(Intent intent) {
        if (Intent.ACTION_SEND.equals(intent.getAction()) &&
            "text/plain".equals(intent.getType())) {
            String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (sharedText != null) {
                SharedPreferences prefs = getSharedPreferences("share_cache", MODE_PRIVATE);
                prefs.edit().putString("sharedText", sharedText).apply();
            }
        }
    }
}
